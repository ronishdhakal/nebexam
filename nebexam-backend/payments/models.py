from django.db import models
from django.conf import settings


# Hardcoded fallback — used if SubscriptionPlan table is empty
PLAN_PRICES = {
    '1month': {'amount': 100,  'months': 1,  'label': '1 Month'},
    '3month': {'amount': 200,  'months': 3,  'label': '3 Months'},
    '1year':  {'amount': 300,  'months': 12, 'label': '1 Year'},
}


class SubscriptionPlan(models.Model):
    TIER_CHOICES = [
        ('1month', '1 Month'),
        ('3month', '3 Months'),
        ('1year',  '1 Year'),
    ]
    tier   = models.CharField(max_length=10, choices=TIER_CHOICES, unique=True)
    label  = models.CharField(max_length=50)
    amount = models.PositiveIntegerField(help_text='Price in NPR')
    months = models.PositiveSmallIntegerField(help_text='Duration in months')

    class Meta:
        ordering = ['months']

    def __str__(self):
        return f'{self.label} — Rs. {self.amount}'


class Coupon(models.Model):
    name             = models.CharField(max_length=255, help_text='Recipient/person name')
    purpose          = models.CharField(max_length=255, blank=True)
    code             = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveSmallIntegerField(help_text='1–100')
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.code} ({self.discount_percent}%) — {self.name}'


class Payment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED  = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCESS, 'Success'),
        (STATUS_FAILED,  'Failed'),
    ]

    user             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    tier             = models.CharField(max_length=10)
    amount           = models.PositiveIntegerField()
    coupon           = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, related_name='payments')
    transaction_uuid = models.CharField(max_length=100, unique=True)
    esewa_ref_id     = models.CharField(max_length=100, blank=True)
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at       = models.DateTimeField(auto_now_add=True)
    verified_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.tier} — {self.status}'
