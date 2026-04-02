#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Blue-Green zero-downtime deploy script
#
#  Usage:
#    bash deploy.sh            # deploy latest main branch
#    bash deploy.sh --no-pull  # skip git pull (deploy already-pulled code)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ACTIVE_FILE=".active_color"
NO_PULL=false

for arg in "$@"; do
  [[ "$arg" == "--no-pull" ]] && NO_PULL=true
done

# ── Determine colors ──────────────────────────────────────────────────────────
CURRENT=$(cat "$ACTIVE_FILE" 2>/dev/null || echo "blue")
if [[ "$CURRENT" == "blue" ]]; then NEW="green"; else NEW="blue"; fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Active: $CURRENT  →  Deploying to: $NEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Pull latest code ────────────────────────────────────────────────────────
if [[ "$NO_PULL" == false ]]; then
  echo "[1/6] Pulling latest code..."
  git pull origin main
else
  echo "[1/6] Skipping git pull (--no-pull)"
fi

# ── 2. Run DB migrations (against current live DB before switching) ───────────
echo "[2/6] Running migrations..."
docker compose --profile "$CURRENT" exec -T "backend-$CURRENT" \
  python manage.py migrate --noinput

# ── 3. Build & start the NEW color ────────────────────────────────────────────
echo "[3/6] Building and starting $NEW stack..."
docker compose --profile "$NEW" up -d --build

# ── 4. Health-check the new stack ─────────────────────────────────────────────
echo "[4/6] Waiting for $NEW stack to be healthy..."

check_healthy() {
  local service="$1"
  local max=40  # 40 × 5s = 200s max
  local i=0
  while [[ $i -lt $max ]]; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "nebexam-${service}-${NEW}" 2>/dev/null || echo "unknown")
    if [[ "$status" == "healthy" ]]; then
      echo "  ✓ $service-$NEW is healthy"
      return 0
    fi
    echo "  … $service-$NEW status: $status (${i}/${max})"
    sleep 5
    ((i++))
  done
  echo "  ✗ $service-$NEW never became healthy — aborting"
  return 1
}

if ! check_healthy "backend"; then
  echo "Rolling back: stopping $NEW stack"
  docker compose --profile "$NEW" down
  exit 1
fi

if ! check_healthy "frontend"; then
  echo "Rolling back: stopping $NEW stack"
  docker compose --profile "$NEW" down
  exit 1
fi

# ── 5. Switch nginx to new color ──────────────────────────────────────────────
echo "[5/6] Switching nginx to $NEW..."
cp "nginx/conf.d/upstream-${NEW}.conf" "nginx/conf.d/upstream.conf"
docker compose exec nginx nginx -s reload
echo "  ✓ nginx now routes to $NEW"

# ── 6. Record new active color & stop old stack ────────────────────────────────
echo "$NEW" > "$ACTIVE_FILE"
echo "[6/6] Stopping old $CURRENT stack..."
sleep 5   # brief grace period for in-flight requests to finish
docker compose --profile "$CURRENT" down

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy complete!  Active color: $NEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
