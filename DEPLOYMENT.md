# NEB Exam — Deployment Guide

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Server Initial Setup](#3-server-initial-setup)
4. [Environment Variables](#4-environment-variables)
5. [First Deploy](#5-first-deploy)
6. [CI/CD Pipeline (GitHub Actions)](#6-cicd-pipeline-github-actions)
7. [How Blue-Green Deployment Works](#7-how-blue-green-deployment-works)
8. [Manual Deploy & Rollback](#8-manual-deploy--rollback)
9. [Common Operations](#9-common-operations)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

```
Internet
    │
    ▼
 Nginx :80/:443          (always running — never restarted during deploys)
    │
    ├─── /api/*  ──────► backend-{active}:8000   (Django + Gunicorn)
    └─── /*  ──────────► frontend-{active}:3000  (Next.js standalone)

Blue stack:  backend-blue  + frontend-blue
Green stack: backend-green + frontend-green

Only ONE color is live at a time.
nginx/conf.d/upstream.conf controls which color receives traffic.
```

**Zero-downtime mechanism:** `nginx -s reload` swaps the upstream atomically — in-flight requests finish on the old color, new requests go to the new color. The old color is only stopped after a grace period.

---

## 2. Prerequisites

Install these on your production server:

```bash
# Docker Engine (Ubuntu 24.04)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # allow running docker without sudo (re-login required)

# Docker Compose plugin (bundled with Docker Engine >= 23)
docker compose version           # verify

# Git
sudo apt install -y git
```

> **Minimum server specs:** 2 vCPU, 2 GB RAM, 20 GB disk.

---

## 3. Server Initial Setup

```bash
# 1. Clone the repository
git clone git@github.com:<your-org>/neb-exam.git /var/www/nebexam
cd /var/www/nebexam

# 2. Create the environment file (see Section 4)
cp nebexam-backend/.env.example .env    # or create manually

# 3. Create the initial nginx upstream (start with blue)
cp nginx/conf.d/upstream-blue.conf nginx/conf.d/upstream.conf

# 4. Record starting color
echo "blue" > .active_color

# 5. Make deploy script executable
chmod +x deploy.sh
```

---

## 4. Environment Variables

Create a single `.env` file at the **repo root** (next to `docker-compose.yml`).
**Never commit this file** — it is gitignored.

```dotenv
# ── Django ─────────────────────────────────────────────────────────────────
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=nebexam.com,www.nebexam.com
CORS_ALLOWED_ORIGINS=https://nebexam.com,https://www.nebexam.com
FRONTEND_URL=https://nebexam.com

# ── Database (PostgreSQL) ───────────────────────────────────────────────────
DB_NAME=nebexam_db
DB_USER=postgres
DB_PASSWORD=<your-db-password>
DB_HOST=<your-db-host>        # IP of your PostgreSQL server or PgBouncer host
DB_PORT=5432                  # 6432 if using PgBouncer

# ── Email (Gmail SMTP with App Password) ───────────────────────────────────
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=<gmail-app-password>  # 16-char app password, not your login password

# ── Cloudflare R2 Storage ───────────────────────────────────────────────────
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=nebexam-media
MEDIA_BASE_URL=https://media.nebexam.com

# ── eSewa Payment ───────────────────────────────────────────────────────────
ESEWA_URL=https://epay.esewa.com.np/api/epay/main/v2/form   # production URL
ESEWA_PRODUCT_CODE=<your-merchant-code>
ESEWA_SECRET_KEY=<your-esewa-secret>

# ── Next.js (baked into the Docker image at build time) ────────────────────
NEXT_PUBLIC_API_URL=https://nebexam.com/api
NEXT_PUBLIC_MEDIA_URL=https://media.nebexam.com
```

> **`NEXT_PUBLIC_*` variables** are embedded into the frontend bundle at build time.
> If you change them you must rebuild the frontend image (`docker compose build frontend-blue`).

---

## 5. First Deploy

Run these commands **once** on the server to bring up the initial stack:

```bash
cd /var/www/nebexam

# Start nginx + blue stack
docker compose --profile blue up -d

# Run database migrations
docker compose exec backend-blue python manage.py migrate

# Create a Django superuser (one-time)
docker compose exec backend-blue python manage.py createsuperuser

# Verify everything is running
docker compose ps
```

Expected output:
```
NAME                      STATUS          PORTS
nebexam-backend-blue      Up (healthy)
nebexam-frontend-blue     Up (healthy)
nebexam-nginx-1           Up              0.0.0.0:80->80/tcp
```

---

## 6. CI/CD Pipeline (GitHub Actions)

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which SSHs into the server and runs `deploy.sh`.

### Required GitHub Secrets

Go to: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description | Example |
|---|---|---|
| `SERVER_HOST` | Server IP or domain | `203.0.113.10` |
| `SERVER_USER` | SSH username | `ubuntu` |
| `SERVER_SSH_KEY` | Full private SSH key | `-----BEGIN OPENSSH...` |
| `SERVER_PORT` | SSH port (optional, default 22) | `22` |
| `APP_DIR` | Absolute path on server | `/var/www/nebexam` |

### Adding the SSH key

```bash
# On your local machine — generate a deploy key
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/nebexam_deploy -N ""

# Copy the PUBLIC key to the server
ssh-copy-id -i ~/.ssh/nebexam_deploy.pub ubuntu@<your-server>

# Paste the PRIVATE key (~/.ssh/nebexam_deploy) into the SERVER_SSH_KEY secret
cat ~/.ssh/nebexam_deploy
```

---

## 7. How Blue-Green Deployment Works

```
Push to main
     │
     ▼
GitHub Actions SSHs into server
     │
     ▼
deploy.sh runs:

  [1] git pull origin main

  [2] DB migrations run on CURRENT live container
      (safe — migrations always backwards-compatible)

  [3] docker compose --profile GREEN up -d --build
      (builds new images, starts green containers)

  [4] Health check loop (up to ~200s)
      Polls Docker healthcheck on backend-green and frontend-green
           │
           ├── UNHEALTHY → tear down green, old blue keeps serving, exit 1
           │
           └── HEALTHY → continue

  [5] cp nginx/conf.d/upstream-green.conf nginx/conf.d/upstream.conf
      docker compose exec nginx nginx -s reload
      ← ZERO DOWNTIME: nginx reload is atomic, no dropped requests

  [6] echo "green" > .active_color
      sleep 5   # drain in-flight requests on blue
      docker compose --profile blue down
```

**Result:** Users never see downtime. If the new build is broken, they stay on the old version.

---

## 8. Manual Deploy & Rollback

### Trigger a manual deploy (without pushing to GitHub)

```bash
cd /var/www/nebexam
bash deploy.sh
```

### Deploy without pulling (already have the code)

```bash
bash deploy.sh --no-pull
```

### Emergency rollback (switch back instantly)

If something is wrong after a deploy and the old color is still stopped:

```bash
# Re-start the old color
BROKEN="green"    # or "blue" — whichever is currently active and broken
OLD="blue"        # the color you want to roll back to

docker compose --profile "$OLD" up -d

# Switch nginx back
cp nginx/conf.d/upstream-${OLD}.conf nginx/conf.d/upstream.conf
docker compose exec nginx nginx -s reload

echo "$OLD" > .active_color

# Stop the broken color
docker compose --profile "$BROKEN" down
```

### Instant rollback if old color is still running

If the old container is still up (within the 5s grace period window):

```bash
ACTIVE=$(cat .active_color)
PREV=$([ "$ACTIVE" = "blue" ] && echo "green" || echo "blue")

cp nginx/conf.d/upstream-${PREV}.conf nginx/conf.d/upstream.conf
docker compose exec nginx nginx -s reload
echo "$PREV" > .active_color
```

---

## 9. Common Operations

### View logs

```bash
# Tail live logs from active color
ACTIVE=$(cat .active_color)
docker compose logs -f backend-$ACTIVE
docker compose logs -f frontend-$ACTIVE

# nginx access logs
docker compose logs -f nginx
```

### Run a Django management command

```bash
ACTIVE=$(cat .active_color)
docker compose exec backend-$ACTIVE python manage.py <command>

# Examples:
docker compose exec backend-$ACTIVE python manage.py migrate
docker compose exec backend-$ACTIVE python manage.py createsuperuser
docker compose exec backend-$ACTIVE python manage.py shell
```

### Rebuild images without deploying

```bash
docker compose build backend-blue backend-green
docker compose build frontend-blue frontend-green
```

### Force a full restart of the active stack

```bash
ACTIVE=$(cat .active_color)
docker compose --profile $ACTIVE restart
```

### Check container health

```bash
docker compose ps
docker inspect nebexam-backend-blue --format='{{.State.Health.Status}}'
```

### Clear Django cache

```bash
ACTIVE=$(cat .active_color)
docker compose exec backend-$ACTIVE python manage.py shell -c "from django.core.cache import cache; cache.clear(); print('Cache cleared')"
```

---

## 10. Troubleshooting

### `nginx -s reload` fails after switching upstream

The `upstream.conf` file is bind-mounted read-only (`:ro`). If you get a permission error:

```bash
# The conf.d directory must NOT be mounted read-only
# Check docker-compose.yml — the nginx volume should be:
#   ./nginx/conf.d:/etc/nginx/conf.d    ← no :ro
# (upstream.conf is written by deploy.sh on the HOST, nginx reads it)
```

### Frontend shows old content after deploy

Next.js caches aggressively. Hard-refresh with `Ctrl+Shift+R`, or check that the new container is actually serving:

```bash
ACTIVE=$(cat .active_color)
docker compose logs frontend-$ACTIVE | tail -20
```

### `collectstatic` fails during Docker build

The backend `Dockerfile` runs `collectstatic` without a database connection. Make sure `STATIC_ROOT` is set. If the build fails because of a missing setting, add to your `.env`:

```dotenv
STATIC_ROOT=/app/staticfiles
```

Or set it directly in `nebexam/settings.py`:

```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### Health check keeps failing

```bash
# Check what's actually wrong inside the container
docker compose logs backend-green

# Test the health endpoint manually
docker compose exec backend-green curl -v http://localhost:8000/api/schema/
```

### Database connection refused

The containers connect to the DB using `DB_HOST` from `.env`. If your DB is on the host machine (not in Docker):

```bash
# Use the Docker gateway IP instead of localhost
DB_HOST=172.17.0.1   # default Docker bridge gateway
```

Or use `host.docker.internal` (works on Docker Desktop, not default on Linux):

```bash
# Add to docker-compose.yml under the backend services:
extra_hosts:
  - "host.docker.internal:host-gateway"

# Then set:
DB_HOST=host.docker.internal
```

### Out of disk space (old images accumulate)

```bash
# Remove dangling images and stopped containers
docker system prune -f

# More aggressive — removes all unused images
docker image prune -a -f
```

---

## Security Checklist

- [ ] `.env` file is **not** committed to git (check with `git status`)
- [ ] `DEBUG=False` in production `.env`
- [ ] `SECRET_KEY` is a long random string (not the insecure dev default)
- [ ] `ALLOWED_HOSTS` contains only your domain(s)
- [ ] SSH key used for GitHub Actions has no passphrase and is **deploy-only** (not your personal key)
- [ ] eSewa `ESEWA_URL` points to the **production** endpoint, not the sandbox (`rc-epay`)
- [ ] Firewall: only ports 80, 443, and your SSH port are open to the internet
