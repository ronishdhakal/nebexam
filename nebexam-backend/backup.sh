#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  PostgreSQL → Cloudflare R2 backup
#  Runs every 12 hours via cron inside the db-backup container.
#  Keeps the last 14 backups (7 days × 2/day), deletes older ones.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="nebexam_${TIMESTAMP}.sql"
TMP_FILE="/tmp/${BACKUP_FILE}"
R2_PREFIX="backup"
MAX_BACKUPS=14   # 7 days × 2 backups/day

echo "[$(date)] ── Starting backup: ${BACKUP_FILE}"

# ── 1. Dump & compress ────────────────────────────────────────────────────────
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-acl \
  > "${TMP_FILE}"

SIZE=$(du -sh "${TMP_FILE}" | cut -f1)
echo "[$(date)] Dump complete — ${SIZE}"

# ── 2. Upload to R2 ───────────────────────────────────────────────────────────
export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="auto"

aws s3 cp "${TMP_FILE}" \
  "s3://${R2_BUCKET_NAME}/${R2_PREFIX}/${BACKUP_FILE}" \
  --endpoint-url "${R2_ENDPOINT}" \
  --no-progress

echo "[$(date)] Uploaded → r2://${R2_BUCKET_NAME}/${R2_PREFIX}/${BACKUP_FILE}"
rm "${TMP_FILE}"

# ── 3. Rotate — keep only last MAX_BACKUPS, delete the rest ──────────────────
echo "[$(date)] Checking rotation (max ${MAX_BACKUPS} backups)..."

BACKUP_LIST=$(aws s3 ls "s3://${R2_BUCKET_NAME}/${R2_PREFIX}/" \
  --endpoint-url "${R2_ENDPOINT}" \
  | sort \
  | awk '{print $4}' \
  | grep -v '^$' || true)

TOTAL=$(echo "${BACKUP_LIST}" | grep -c '.' || true)

if [ "${TOTAL}" -gt "${MAX_BACKUPS}" ]; then
  DELETE_COUNT=$(( TOTAL - MAX_BACKUPS ))
  echo "[$(date)] Deleting ${DELETE_COUNT} old backup(s)..."
  echo "${BACKUP_LIST}" | head -n "${DELETE_COUNT}" | while IFS= read -r OLD_FILE; do
    aws s3 rm "s3://${R2_BUCKET_NAME}/${R2_PREFIX}/${OLD_FILE}" \
      --endpoint-url "${R2_ENDPOINT}"
    echo "[$(date)] Deleted: ${OLD_FILE}"
  done
else
  echo "[$(date)] ${TOTAL}/${MAX_BACKUPS} backups stored — no rotation needed"
fi

echo "[$(date)] ── Backup complete"
