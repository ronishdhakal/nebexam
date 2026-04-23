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
    tier        = models.CharField(max_length=10, choices=TIER_CHOICES, unique=True)
    label       = models.CharField(max_length=50)
    amount      = models.PositiveIntegerField(help_text='Price in NPR')
    months      = models.PositiveSmallIntegerField(help_text='Duration in months')
    offer_title = models.CharField(max_length=100, blank=True, help_text='Short offer label, e.g. "Dashain Offer"')
    offer_price = models.PositiveIntegerField(null=True, blank=True, help_text='Discounted price in NPR; leave blank for no offer')

    class Meta:
        ordering = ['months']

    def __str__(self):
        return f'{self.label} — Rs. {self.amount}'


class Coupon(models.Model):
    name             = models.CharField(max_length=255, help_text='Recipient/person name')
    purpose          = models.CharField(max_length=255, blank=True)
    code             = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveSmallIntegerField(help_text='1–100')
    max_uses         = models.PositiveIntegerField(null=True, blank=True, help_text='Leave blank for unlimited')
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
    referred_by      = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='referral_payments')
    transaction_uuid = models.CharField(max_length=100, unique=True)
    esewa_ref_id     = models.CharField(max_length=100, blank=True)
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at       = models.DateTimeField(auto_now_add=True)
    verified_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.tier} — {self.status}'


class CheckoutAttempt(models.Model):
    """Updated every time an authenticated user lands on the checkout page."""
    user         = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='checkout_attempt')
    tier         = models.CharField(max_length=10)
    attempted_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} → {self.tier} @ {self.attempted_at:%Y-%m-%d %H:%M}'


class PayoutRequest(models.Model):
    """A student's request to withdraw their referral balance."""
    STATUS_PENDING  = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES  = [
        (STATUS_PENDING,  'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_requests')
    amount         = models.DecimalField(max_digits=10, decimal_places=2, help_text='Balance snapshot at time of request')
    payment_method = models.CharField(max_length=50, help_text='e.g. eSewa, Bank Transfer')
    payment_detail = models.CharField(max_length=255, help_text='eSewa number / bank account / etc.')
    status         = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    admin_note     = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)
    paid_at        = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — Rs. {self.amount} ({self.status})'


class ReferralReward(models.Model):
    """Tracks the 10% reward earned by a referrer when their code is used in a successful payment."""
    STATUS_PENDING  = 'pending'
    STATUS_RELEASED = 'released'
    STATUS_CHOICES  = [
        (STATUS_PENDING,  'Pending'),
        (STATUS_RELEASED, 'Released'),
    ]

    referrer      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referral_rewards_earned')
    referee       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referral_rewards_given')
    payment       = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='referral_reward')
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at    = models.DateTimeField(auto_now_add=True)
    released_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.referrer.email} ← {self.referee.email} — Rs. {self.reward_amount} ({self.status})'
