from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,base.nebexam.com,www.nebexam.com,'
    'nebexam-backend-blue,nebexam-backend-green'
).split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # third party
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',
    # apps
    'users',
    'content',
    'questionbank',
    'payments',
    'news',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nebexam.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nebexam.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.getenv('DB_NAME', 'nebexam_db'),
        'USER':     os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST':     os.getenv('DB_HOST', '127.0.0.1'),
        'PORT':     os.getenv('DB_PORT', '5432'),
        'CONN_MAX_AGE': 0,  # let PgBouncer own the pooling, Django keeps connections stateless
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Cloudflare R2 Storage ──────────────────────────────────────────────────
_R2_KEY_ID     = os.getenv('R2_ACCESS_KEY_ID')
_R2_SECRET_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
_R2_ENDPOINT   = os.getenv('R2_ENDPOINT')
_R2_BUCKET     = os.getenv('R2_BUCKET_NAME')
MEDIA_BASE_URL = os.getenv('MEDIA_BASE_URL', '')

if _R2_KEY_ID and _R2_SECRET_KEY and _R2_ENDPOINT and _R2_BUCKET:
    INSTALLED_APPS += ['storages']
    STORAGES = {
        'default': {'BACKEND': 'nebexam.storage.HyphenatedS3Storage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    }
    AWS_ACCESS_KEY_ID        = _R2_KEY_ID
    AWS_SECRET_ACCESS_KEY    = _R2_SECRET_KEY
    AWS_STORAGE_BUCKET_NAME  = _R2_BUCKET
    AWS_S3_ENDPOINT_URL      = _R2_ENDPOINT
    AWS_S3_REGION_NAME       = 'auto'
    AWS_DEFAULT_ACL          = None          # R2 uses bucket-level access policies
    AWS_S3_FILE_OVERWRITE    = False         # keep original filenames unique
    AWS_QUERYSTRING_AUTH     = False         # public bucket — no signed URLs
    AWS_S3_CUSTOM_DOMAIN     = MEDIA_BASE_URL.replace('https://', '').replace('http://', '')
    MEDIA_URL = f'{MEDIA_BASE_URL}/'
else:
    # Fallback: local storage for development without R2 credentials
    MEDIA_URL  = '/uploads/'
    MEDIA_ROOT = BASE_DIR / 'uploads'

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,https://www.nebexam.com'
).split(',')
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost,http://localhost:8000,https://www.nebexam.com,https://base.nebexam.com'
).split(',')

# ── HTTPS security headers (production only) ──────────────────────────────
if not DEBUG:
    SECURE_PROXY_SSL_HEADER        = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE          = True
    CSRF_COOKIE_SECURE             = True
    SECURE_HSTS_SECONDS            = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',  # keep for admin/legacy
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

AUTH_USER_MODEL = 'users.User'

# ── JWT ────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=300),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=300),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── Email (Gmail SMTP) ─────────────────────────────────────────────────────
EMAIL_BACKEND    = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST       = 'smtp.gmail.com'
EMAIL_PORT       = 587
EMAIL_USE_TLS    = True
EMAIL_HOST_USER  = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = f'NEBExam <{EMAIL_HOST_USER}>'

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# ── eSewa Payment ───────────────────────────────────────────────────────────
ESEWA_URL          = os.getenv('ESEWA_URL', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form')
ESEWA_PRODUCT_CODE = os.getenv('ESEWA_PRODUCT_CODE', 'EPAYTEST')
ESEWA_SECRET_KEY   = os.getenv('ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q')

# ── Cache (file-based) ────────────────────────────────────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': BASE_DIR / '.cache',
        'TIMEOUT': 60 * 60,  # 1 hour default
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        },
    }
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'NEB Exam API',
    'DESCRIPTION': 'API for NEB Educational Platform',
    'VERSION': '1.0.0',
}
