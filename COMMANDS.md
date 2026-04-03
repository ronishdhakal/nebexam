# NEB Exam — Deployment Commands (First to Last)

All commands run on the **production server** as your deploy user.
Read DEPLOYMENT.md for full explanations of each step.

---

## STEP 1 — Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

---

## STEP 2 — Clone the Repository

```bash
git clone https://github.com/ronishdhakal/nebexam.git /var/www/nebexam
cd /var/www/nebexam
```

---

## STEP 3 — Create Environment Files

### Backend (`nebexam-backend/.env`)

```bash
nano nebexam-backend/.env
```

```dotenv
SECRET_KEY=<python3 -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=False
ALLOWED_HOSTS=base.nebexam.com,www.nebexam.com,nebexam-backend-blue,nebexam-backend-green
CORS_ALLOWED_ORIGINS=https://www.nebexam.com
CSRF_TRUSTED_ORIGINS=https://www.nebexam.com,https://base.nebexam.com
FRONTEND_URL=https://www.nebexam.com

DB_NAME=nebexam_db
DB_USER=postgres
DB_PASSWORD=your_strong_password
DB_HOST=host.docker.internal
DB_PORT=5432

EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your_16char_app_password

CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_BUCKET_NAME=nebexam-media
MEDIA_BASE_URL=https://media.nebexam.com

ESEWA_URL=https://epay.esewa.com.np/api/epay/main/v2/form
ESEWA_PRODUCT_CODE=your_merchant_code
ESEWA_SECRET_KEY=your_esewa_secret
```

### Frontend (`nebexam-frontend/.env`)

```bash
nano nebexam-frontend/.env
```

```dotenv
NEXT_PUBLIC_API_URL=https://base.nebexam.com/api
NEXT_PUBLIC_MEDIA_URL=https://media.nebexam.com
NEXT_PUBLIC_SITE_URL=https://www.nebexam.com
```

---

## STEP 4 — SSL Certificate (Cloudflare Origin Certificate)

1. Cloudflare Dashboard → your domain → **SSL/TLS → Origin Server → Create Certificate**
2. Select wildcard: `*.nebexam.com` and `nebexam.com`, validity 15 years
3. Download **PEM format** → you get `certificate.pem` and `private.key`

Upload to server from your **local machine**:

```bash
scp certificate.pem ubuntu@77.37.47.54:/var/www/nebexam/nginx/ssl/fullchain.pem
scp private.key     ubuntu@77.37.47.54:/var/www/nebexam/nginx/ssl/privkey.pem
```

Back on the server:

```bash
chmod 600 /var/www/nebexam/nginx/ssl/privkey.pem
```

---

## STEP 5 — Initial Setup

```bash
cd /var/www/nebexam

# Set starting upstream to blue
cp nginx/conf.d/upstream-blue.conf nginx/conf.d/upstream.conf

# Record starting color
echo "blue" > .active_color

# Make deploy script executable
chmod +x deploy.sh

# Create shared Docker network
docker network create nebexam-net
```

---

## STEP 6 — Start Backend (Blue)

```bash
docker compose -f nebexam-backend/docker-compose.yml --profile blue up -d --build
```

---

## STEP 7 — Start Frontend + Nginx (Blue)

```bash
docker compose -f nebexam-frontend/docker-compose.yml --profile blue up -d --build
```

---

## STEP 8 — Run Database Migrations

```bash
docker exec nebexam-backend-blue python manage.py migrate
```

---

## STEP 9 — Create Django Superuser

```bash
docker exec -it nebexam-backend-blue python manage.py createsuperuser
```

---

## STEP 10 — Verify Everything is Running

```bash
# All three should show as Up
docker ps

# Test frontend
curl -I https://www.nebexam.com

# Test backend API
curl -I https://base.nebexam.com/api/

# Check nginx logs for errors
docker logs nebexam-frontend-nginx-1
```

---

## ONGOING — Deploy New Code

```bash
cd /var/www/nebexam
bash deploy.sh
```

---

## ONGOING — Rollback to Previous Version

```bash
cd /var/www/nebexam
ACTIVE=$(cat .active_color)
PREV=$([ "$ACTIVE" = "blue" ] && echo "green" || echo "blue")

docker compose -f nebexam-backend/docker-compose.yml  --profile "$PREV" up -d
docker compose -f nebexam-frontend/docker-compose.yml --profile "$PREV" up -d

cp nginx/conf.d/upstream-${PREV}.conf nginx/conf.d/upstream.conf
docker compose -f nebexam-frontend/docker-compose.yml exec nginx nginx -s reload

echo "$PREV" > .active_color

docker compose -f nebexam-backend/docker-compose.yml  --profile "$ACTIVE" down
docker compose -f nebexam-frontend/docker-compose.yml --profile "$ACTIVE" down
```

---

## USEFUL — Day-to-Day Commands

```bash
# View logs
docker logs -f nebexam-backend-blue
docker logs -f nebexam-frontend-blue
docker logs -f nebexam-frontend-nginx-1

# Run any Django management command
docker exec nebexam-backend-blue python manage.py <command>

# Clear Django cache
docker exec nebexam-backend-blue python manage.py shell \
  -c "from django.core.cache import cache; cache.clear()"

# Free up disk space
docker system prune -f
```
