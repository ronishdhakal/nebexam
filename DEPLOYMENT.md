# NEB Exam — Production Deployment Guide

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [DNS Setup](#3-dns-setup)
4. [SSL Certificate Setup](#4-ssl-certificate-setup)
5. [Server Initial Setup](#5-server-initial-setup)
6. [Environment Variables](#6-environment-variables)
7. [First Deploy](#7-first-deploy)
8. [How Blue-Green Deployment Works](#8-how-blue-green-deployment-works)
9. [Ongoing Deploys](#9-ongoing-deploys)
10. [Manual Deploy & Rollback](#10-manual-deploy--rollback)
11. [Common Operations](#11-common-operations)
12. [Troubleshooting](#12-troubleshooting)
13. [Security Checklist](#13-security-checklist)

---

## 1. Architecture Overview

```
Browser
   │
   ├── https://www.nebexam.com  ──► Nginx :443 ──► frontend-{color}:3000  (Next.js)
   └── https://base.nebexam.com ──► Nginx :443 ──► backend-{color}:8000   (Django + Gunicorn)

                                    ┌─────────────────────────┐
                                    │   Docker network:       │
                                    │   nebexam-net           │
                                    │                         │
                                    │  nebexam-backend-blue   │
                                    │  nebexam-backend-green  │
                                    │  nebexam-frontend-blue  │
                                    │  nebexam-frontend-green │
                                    │  nebexam-frontend-nginx │
                                    └─────────────────────────┘

Blue-Green: only ONE color is live at a time.
nginx/conf.d/upstream.conf controls which color receives traffic.
```

**Zero-downtime deploys:** `nginx -s reload` swaps the upstream atomically.
In-flight requests finish on the old color; new requests go to the new color.
The old color is only stopped after a 5-second grace period.

**Compose files:**
- `nebexam-backend/docker-compose.yml` — backend (blue + green)
- `nebexam-frontend/docker-compose.yml` — frontend (blue + green) + nginx

Both share the external Docker network `nebexam-net`.

---

## 2. Prerequisites

Install on your Ubuntu/Debian production server:

```bash
# Docker Engine
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER    # re-login after this

# Verify
docker compose version           # should be 2.x+
git --version
```

> **Minimum server specs:** 2 vCPU, 2 GB RAM, 20 GB disk.
> Open firewall ports: **22** (SSH), **80** (HTTP), **443** (HTTPS).
> Port 8000 is only needed for local dev — do NOT open it on production.

---

## 3. DNS Setup

In your domain registrar / Cloudflare DNS panel, create these A records pointing to your server IP:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `www` | `77.37.47.54` | Proxied (orange) |
| A | `base` | `77.37.47.54` | Proxied (orange) |

> If using Cloudflare proxy (recommended), set SSL/TLS mode to **Full (strict)** in Cloudflare dashboard → SSL/TLS → Overview.

---

## 4. SSL Certificate Setup

You need a wildcard certificate for `*.nebexam.com` covering both `www.nebexam.com` and `base.nebexam.com`. Choose one method:

### Option A — Cloudflare Origin Certificate (recommended if using Cloudflare)

1. Cloudflare Dashboard → your domain → **SSL/TLS → Origin Server → Create Certificate**
2. Choose **wildcard**: `*.nebexam.com` and `nebexam.com`
3. Set validity: 15 years
4. Download **PEM format** — you get two files: `certificate.pem` and `private.key`
5. On your server:

```bash
sudo mkdir -p /var/www/nebexam/nginx/ssl
sudo cp certificate.pem /var/www/nebexam/nginx/ssl/fullchain.pem
sudo cp private.key     /var/www/nebexam/nginx/ssl/privkey.pem
sudo chmod 600 /var/www/nebexam/nginx/ssl/privkey.pem
```

### Option B — Let's Encrypt (if NOT using Cloudflare proxy)

```bash
sudo apt install -y certbot

# Obtain wildcard cert (requires DNS challenge)
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d '*.nebexam.com' \
  -d 'nebexam.com'

# Certs are placed at:
# /etc/letsencrypt/live/nebexam.com/fullchain.pem
# /etc/letsencrypt/live/nebexam.com/privkey.pem

# Symlink into the project ssl folder
sudo mkdir -p /var/www/nebexam/nginx/ssl
sudo ln -s /etc/letsencrypt/live/nebexam.com/fullchain.pem \
           /var/www/nebexam/nginx/ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/nebexam.com/privkey.pem  \
           /var/www/nebexam/nginx/ssl/privkey.pem
```

> Let's Encrypt certs expire every 90 days. Set up auto-renewal:
> ```bash
> echo "0 3 * * * certbot renew --quiet && docker restart nebexam-frontend-nginx-1" \
>   | sudo crontab -
> ```

---

## 5. Server Initial Setup

Run these **once** on the production server:

```bash
# 1. Clone the repository
git clone https://github.com/ronishdhakal/nebexam.git /var/www/nebexam
cd /var/www/nebexam

# 2. Create the environment files (see Section 6)
nano nebexam-backend/.env    # Django/backend vars
nano nebexam-frontend/.env   # Next.js frontend vars

# 3. Set the starting upstream (blue)
cp nginx/conf.d/upstream-blue.conf nginx/conf.d/upstream.conf

# 4. Record starting color
echo "blue" > .active_color

# 5. Make deploy script executable
chmod +x deploy.sh

# 6. Create the shared Docker network
docker network create nebexam-net
```

---

## 6. Environment Variables

There are **two separate `.env` files** — one per service directory.
**Never commit either file** — both must be in `.gitignore`.

### `nebexam-backend/.env`

```dotenv
SECRET_KEY=<generate: python3 -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=False
ALLOWED_HOSTS=base.nebexam.com,www.nebexam.com,nebexam-backend-blue,nebexam-backend-green
CORS_ALLOWED_ORIGINS=https://www.nebexam.com
CSRF_TRUSTED_ORIGINS=https://www.nebexam.com,https://base.nebexam.com
FRONTEND_URL=https://www.nebexam.com

DB_NAME=nebexam_db
DB_USER=postgres
DB_PASSWORD=<your-strong-db-password>
DB_HOST=host.docker.internal
DB_PORT=5432

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=<16-char gmail app password>

CLOUDFLARE_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-r2-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret>
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=nebexam-media
MEDIA_BASE_URL=https://media.nebexam.com

ESEWA_URL=https://epay.esewa.com.np/api/epay/main/v2/form
ESEWA_PRODUCT_CODE=<your-merchant-code>
ESEWA_SECRET_KEY=<your-esewa-secret>
```

### `nebexam-frontend/.env`

```dotenv
# IMPORTANT: baked into the Docker image at build time.
# Rebuild the frontend image if you change these.
NEXT_PUBLIC_API_URL=https://base.nebexam.com/api
NEXT_PUBLIC_MEDIA_URL=https://media.nebexam.com
NEXT_PUBLIC_SITE_URL=https://www.nebexam.com
```

---

## 7. First Deploy

Run these commands once on the server to bring up the initial stack:

```bash
cd /var/www/nebexam

# Start backend (blue)
docker compose -f nebexam-backend/docker-compose.yml --profile blue up -d --build

# Start frontend + nginx (blue)
docker compose -f nebexam-frontend/docker-compose.yml --profile blue up -d --build

# Run database migrations
docker exec nebexam-backend-blue python manage.py migrate

# Create Django superuser (one-time)
docker exec -it nebexam-backend-blue python manage.py createsuperuser

# Verify all containers are running
docker ps
```

Expected output:
```
NAMES                        STATUS
nebexam-backend-blue         Up (healthy)
nebexam-frontend-blue        Up (healthy)
nebexam-frontend-nginx-1     Up
```

Test the endpoints:
```bash
curl -I https://www.nebexam.com          # should return 200
curl -I https://base.nebexam.com/api/    # should return 200
```

---

## 8. How Blue-Green Deployment Works

```
Push to main
     │
     ▼
GitHub Actions SSHs into server → runs deploy.sh

  [1] git pull origin main

  [2] DB migrations on CURRENT live container

  [3] Build + start NEW color (backend + frontend)
      docker compose --profile GREEN up -d --build

  [4] Health check loop (up to 200s)
      ├── UNHEALTHY → tear down new color, keep old, exit 1
      └── HEALTHY   → continue

  [5] cp nginx/conf.d/upstream-GREEN.conf nginx/conf.d/upstream.conf
      docker compose exec nginx nginx -s reload
      ← ZERO DOWNTIME: atomic upstream swap

  [6] echo "green" > .active_color
      sleep 5  (drain in-flight requests)
      docker compose --profile BLUE down
```

### GitHub Actions Setup

Go to: **GitHub → Settings → Secrets and variables → Actions**

| Secret | Value |
|--------|-------|
| `SERVER_HOST` | Your server IP |
| `SERVER_USER` | `ubuntu` (or your user) |
| `SERVER_SSH_KEY` | Contents of your private deploy key |
| `SERVER_PORT` | `22` |
| `APP_DIR` | `/var/www/nebexam` |

Generate a deploy key:
```bash
ssh-keygen -t ed25519 -C "github-deploy-nebexam" -f ~/.ssh/nebexam_deploy -N ""
ssh-copy-id -i ~/.ssh/nebexam_deploy.pub ubuntu@77.37.47.54
# Paste contents of ~/.ssh/nebexam_deploy into SERVER_SSH_KEY secret
```

---

## 9. Ongoing Deploys

### Automatic (push to main)
Just push to `main` — GitHub Actions runs `deploy.sh` automatically.

### Manual deploy from server
```bash
cd /var/www/nebexam
bash deploy.sh

# Skip git pull if code is already on server:
bash deploy.sh --no-pull
```

---

## 10. Manual Deploy & Rollback

### Emergency rollback (switch back to previous color instantly)

```bash
cd /var/www/nebexam
ACTIVE=$(cat .active_color)
PREV=$([ "$ACTIVE" = "blue" ] && echo "green" || echo "blue")

# Restart previous color if stopped
docker compose -f nebexam-backend/docker-compose.yml  --profile "$PREV" up -d
docker compose -f nebexam-frontend/docker-compose.yml --profile "$PREV" up -d

# Switch nginx
cp nginx/conf.d/upstream-${PREV}.conf nginx/conf.d/upstream.conf
docker compose -f nebexam-frontend/docker-compose.yml exec nginx nginx -s reload

echo "$PREV" > .active_color

# Stop broken color
docker compose -f nebexam-backend/docker-compose.yml  --profile "$ACTIVE" down
docker compose -f nebexam-frontend/docker-compose.yml --profile "$ACTIVE" down
```

---

## 11. Common Operations

### View logs

```bash
ACTIVE=$(cat .active_color)

# Backend logs
docker logs -f nebexam-backend-$ACTIVE

# Frontend logs
docker logs -f nebexam-frontend-$ACTIVE

# Nginx access/error logs
docker logs -f nebexam-frontend-nginx-1
```

### Run a Django management command

```bash
ACTIVE=$(cat .active_color)
docker exec nebexam-backend-$ACTIVE python manage.py migrate
docker exec nebexam-backend-$ACTIVE python manage.py createsuperuser
docker exec nebexam-backend-$ACTIVE python manage.py shell
```

### Clear Django cache

```bash
ACTIVE=$(cat .active_color)
docker exec nebexam-backend-$ACTIVE python manage.py shell \
  -c "from django.core.cache import cache; cache.clear(); print('Cache cleared')"
```

### Rebuild images only (without deploying)

```bash
docker compose --project-directory . \
  -f nebexam-backend/docker-compose.yml build

docker compose --project-directory . \
  -f nebexam-frontend/docker-compose.yml build
```

### Check container health

```bash
docker ps
docker inspect nebexam-backend-blue --format='{{.State.Health.Status}}'
```

### Free disk space (remove old images)

```bash
docker system prune -f
docker image prune -a -f
```

---

## 12. Troubleshooting

### 502 Bad Gateway on www.nebexam.com or base.nebexam.com

Nginx is running but can't reach the upstream.

```bash
# 1. Check if upstream containers are running
docker ps

# 2. Check upstream.conf has correct container names
cat nginx/conf.d/upstream.conf
# Should be: server nebexam-backend-blue:8000 / server nebexam-frontend-blue:3000

# 3. Verify containers are on nebexam-net
docker network inspect nebexam-net

# 4. Check nginx error log
docker logs nebexam-frontend-nginx-1
```

### Frontend shows "0 subjects" / empty pages (SSR not fetching data)

The Next.js server-side code uses `INTERNAL_API_URL` to reach the backend.
Check it is set in the running container:

```bash
docker exec nebexam-frontend-blue env | grep INTERNAL_API_URL
# Should be: INTERNAL_API_URL=http://nebexam-backend-blue:8000/api

# Test connectivity from frontend to backend
docker exec nebexam-frontend-blue wget -qO- http://nebexam-backend-blue:8000/api/content/subjects/
```

If it returns 400, `nebexam-backend-blue` is not in Django's `ALLOWED_HOSTS`.
Check your `.env`: `ALLOWED_HOSTS` must include `nebexam-backend-blue,nebexam-backend-green`.

### CSRF verification failed (Django admin 403)

Add the relevant origins to `CSRF_TRUSTED_ORIGINS` in `.env`:
```dotenv
CSRF_TRUSTED_ORIGINS=https://www.nebexam.com,https://base.nebexam.com
```
Then restart the backend: `docker restart nebexam-backend-blue`

### SSL certificate errors

```bash
# Verify cert files exist and are readable by nginx
ls -la nginx/ssl/
docker exec nebexam-frontend-nginx-1 nginx -t
```

If using Cloudflare Origin Certificate, make sure Cloudflare SSL mode is **Full (strict)**, not Flexible.

### `host not found in upstream` in nginx logs

The upstream.conf still uses old service alias names. Verify:
```bash
cat nginx/conf.d/upstream.conf
# Correct format:
# upstream backend  { server nebexam-backend-blue:8000; }
# upstream frontend { server nebexam-frontend-blue:3000; }
```

### Database connection refused

```bash
# Test DB connectivity from inside backend container
ACTIVE=$(cat .active_color)
docker exec nebexam-backend-$ACTIVE python manage.py dbshell
```

If DB is on the host machine, use `host.docker.internal` as `DB_HOST` and add to both backend services in `nebexam-backend/docker-compose.yml`:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Health check keeps failing

```bash
docker logs nebexam-backend-blue | tail -30
docker exec nebexam-backend-blue curl -v http://localhost:8000/api/schema/
```

### Out of disk space

```bash
docker system prune -f
docker image prune -a -f
```

---

## 13. Security Checklist

Before going live, verify:

- [ ] `.env` is in `.gitignore` and **never committed**
- [ ] `DEBUG=False` in production `.env`
- [ ] `SECRET_KEY` is a long random string (not the insecure dev default)
- [ ] `ALLOWED_HOSTS` contains only your domains + container names
- [ ] SSL certificates are in place and nginx returns HTTPS
- [ ] Cloudflare SSL mode is set to **Full (strict)**
- [ ] Firewall: only ports **22**, **80**, **443** open — **not 8000**
- [ ] `ESEWA_URL` points to the **production** endpoint (not `rc-epay` sandbox)
- [ ] `ESEWA_PRODUCT_CODE` is your real merchant code (not `EPAYTEST`)
- [ ] GitHub deploy key is a dedicated key — not your personal SSH key
- [ ] Database password is strong and different from any dev password
- [ ] `NEXT_PUBLIC_API_URL` is `https://base.nebexam.com/api` (not localhost)
