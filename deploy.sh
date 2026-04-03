#!/usr/bin/env bash
set -euo pipefail

ACTIVE_FILE=".active_color"
NO_PULL=false

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DC_BACKEND="docker compose -f $SCRIPT_DIR/nebexam-backend/docker-compose.yml"
DC_FRONTEND="docker compose -f $SCRIPT_DIR/nebexam-frontend/docker-compose.yml"

for arg in "$@"; do
  [[ "$arg" == "--no-pull" ]] && NO_PULL=true
done

docker network create nebexam-net 2>/dev/null || true

CURRENT=$(cat "$ACTIVE_FILE" 2>/dev/null || echo "blue")
if [[ "$CURRENT" == "blue" ]]; then NEW="green"; else NEW="blue"; fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Active: $CURRENT  →  Deploying to: $NEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$NO_PULL" == false ]]; then
  echo "[1/6] Pulling latest code..."
  git pull origin master
else
  echo "[1/6] Skipping git pull (--no-pull)"
fi

echo "[2/6] Running migrations..."
$DC_BACKEND --profile "$CURRENT" exec -T "backend-$CURRENT" \
  python manage.py migrate --noinput

echo "[3/6] Building and starting $NEW stack..."
$DC_BACKEND  --profile "$NEW" up -d --build
$DC_FRONTEND --profile "$NEW" up -d --build

echo "[4/6] Waiting for $NEW stack to be healthy..."

check_healthy() {
  local service="$1"
  local max=40
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
  docker stop nebexam-backend-$NEW nebexam-frontend-$NEW 2>/dev/null || true
  exit 1
fi

if ! check_healthy "frontend"; then
  echo "Rolling back: stopping $NEW stack"
  docker stop nebexam-backend-$NEW nebexam-frontend-$NEW 2>/dev/null || true
  exit 1
fi

echo "[5/6] Switching nginx to $NEW..."
cp "$SCRIPT_DIR/nginx/conf.d/upstream-${NEW}.conf" "$SCRIPT_DIR/nginx/conf.d/upstream.conf"
$DC_FRONTEND exec nginx nginx -s reload
echo "  ✓ nginx now routes to $NEW"

# Update host nginx backend port
if [[ "$NEW" == "green" ]]; then
  BACKEND_PORT=8056
else
  BACKEND_PORT=8055
fi
sudo sed -i "s|proxy_pass http://127.0.0.1:805[56];|proxy_pass http://127.0.0.1:${BACKEND_PORT};|g" /etc/nginx/sites-available/nebexam
sudo nginx -t && sudo systemctl reload nginx
echo "  ✓ host nginx backend port updated to $BACKEND_PORT"

echo "$NEW" > "$ACTIVE_FILE"
echo "[6/6] Stopping old $CURRENT containers only..."
sleep 5
docker stop nebexam-backend-$CURRENT nebexam-frontend-$CURRENT 2>/dev/null || true
docker rm nebexam-backend-$CURRENT nebexam-frontend-$CURRENT 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy complete!  Active color: $NEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"