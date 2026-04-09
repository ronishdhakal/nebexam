import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


def _classify_device(user_agent: str) -> str:
    """Return 'mobile' or 'desktop' based on the User-Agent string."""
    ua = (user_agent or '').lower()
    if any(k in ua for k in ('mobile', 'android', 'iphone', 'ipad', 'ipod', 'windows phone')):
        return 'mobile'
    return 'desktop'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class SubscriptionTier(models.TextChoices):
        FREE   = 'free',   'Free'
        MONTH1 = '1month', '1 Month'
        MONTH3 = '3month', '3 Months'
        YEAR1  = '1year',  '1 Year'

    class Level(models.TextChoices):
        CLASS_8  = '8',  'Class 8'
        CLASS_9  = '9',  'Class 9'
        CLASS_10 = '10', 'Class 10'
        CLASS_11 = '11', 'Class 11'
        CLASS_12 = '12', 'Class 12'

    class Stream(models.TextChoices):
        SCIENCE    = 'science',    'Science'
        MANAGEMENT = 'management', 'Management'

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    level = models.CharField(max_length=2, choices=Level.choices, blank=True)
    stream = models.CharField(max_length=15, choices=Stream.choices, blank=True)
    subscription_tier = models.CharField(
        max_length=10, choices=SubscriptionTier.choices, default=SubscriptionTier.FREE
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    free_answers_used  = models.PositiveIntegerField(default=0)
    referral_code      = models.CharField(max_length=10, unique=True, blank=True)
    referral_balance   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    CRM_NONE       = 'none'
    CRM_FOLLOW_UP  = 'follow_up'
    CRM_CONTACTED  = 'contacted'
    CRM_DONE       = 'done'
    CRM_CHOICES    = [
        (CRM_NONE,      'None'),
        (CRM_FOLLOW_UP, 'Follow Up'),
        (CRM_CONTACTED, 'Contacted'),
        (CRM_DONE,      'Done'),
    ]
    crm_status = models.CharField(max_length=20, choices=CRM_CHOICES, default=CRM_NONE)
    is_email_verified = models.BooleanField(default=False)
    district = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self._generate_referral_code()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_referral_code():
        import random, string
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choices(chars, k=8))
            if not User.objects.filter(referral_code=code).exists():
                return code

    def __str__(self):
        return f'{self.name} ({self.email})'


class PasswordResetOTP(models.Model):
    """6-digit OTP for password reset, expires in 15 minutes."""
    user       = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reset_otps')
    code       = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used       = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'OTP for {self.user.email}'


class EmailVerificationOTP(models.Model):
    """6-digit OTP sent to verify email on registration, expires in 15 minutes."""
    user       = models.ForeignKey('User', on_delete=models.CASCADE, related_name='verification_otps')
    code       = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used       = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Verification OTP for {self.user.email}'


class PasswordHistory(models.Model):
    """Stores hashed passwords to prevent reuse of the last 3 passwords."""
    user         = models.ForeignKey('User', on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=255)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Password history for {self.user.email}'


class SiteSettings(models.Model):
    """Singleton model for site-wide settings. Only one row (pk=1) ever exists."""
    subscription_required = models.BooleanField(
        default=True,
        help_text='If disabled, all content is freely accessible without subscription.',
    )
    esewa_enabled = models.BooleanField(
        default=False,
        help_text='If enabled, users pay via eSewa. If disabled, upgrades go through WhatsApp.',
    )
    email_verification_enabled = models.BooleanField(
        default=True,
        help_text='If enabled, users must verify email via OTP on registration and get 4 free answer reveals. If disabled, no OTP required and free users get 0 answer reveals.',
    )

    # App install tracking
    app_install_count = models.PositiveIntegerField(default=0)

    # Study Abroad lead capture form
    lead_form_enabled = models.BooleanField(default=False, help_text='Show the study abroad lead form on Class 12 chapter pages.')
    lead_form_title   = models.CharField(max_length=255, blank=True, default='Planning to Study Abroad?')
    lead_form_image   = models.ImageField(upload_to='lead_form/', null=True, blank=True)

    # Contact / social info (editable from admin CRM)
    contact_email    = models.CharField(max_length=254, blank=True, default='nebexamofficial@gmail.com')
    contact_phone    = models.CharField(max_length=20,  blank=True, default='9745450062')
    contact_address  = models.CharField(max_length=255, blank=True, default='')
    contact_wa       = models.CharField(max_length=20,  blank=True, default='9779745450062',
                                        help_text='WhatsApp number in international format, e.g. 9779745450062')
    social_facebook  = models.URLField(blank=True, default='')
    social_instagram = models.URLField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Site Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Site Settings'


class StudySession(models.Model):
    """Records time a user spent studying a chapter."""
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    subject_name = models.CharField(max_length=255, blank=True)
    subject_slug = models.CharField(max_length=255, blank=True)
    chapter_name = models.CharField(max_length=255, blank=True)
    chapter_slug = models.CharField(max_length=255, blank=True)
    duration     = models.PositiveIntegerField()   # seconds
    logged_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f'{self.user.email} — {self.subject_name} — {self.duration}s'


class UserSession(models.Model):
    """Tracks active sessions per device type (max 1 desktop + 1 mobile)."""
    DEVICE_DESKTOP = 'desktop'
    DEVICE_MOBILE  = 'mobile'
    DEVICE_CHOICES = [(DEVICE_DESKTOP, 'Desktop'), (DEVICE_MOBILE, 'Mobile')]

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_sessions')
    device_type = models.CharField(max_length=10, choices=DEVICE_CHOICES)
    jti         = models.CharField(max_length=255, unique=True)
    user_agent  = models.TextField(blank=True)
    device_id   = models.CharField(max_length=64, blank=True)   # persistent client-generated UUID
    created_at  = models.DateTimeField(auto_now_add=True)
    last_used   = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'device_type')

    def __str__(self):
        return f'{self.user.email} — {self.device_type}'