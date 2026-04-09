from django.db import models
from django.conf import settings


class StudyAbroadLead(models.Model):
    COUNTRY_CHOICES = [
        ('australia',    'Australia'),
        ('canada',       'Canada'),
        ('new_zealand',  'New Zealand'),
        ('uk',           'United Kingdom'),
        ('usa',          'United States'),
        ('other',        'Other'),
    ]

    name               = models.CharField(max_length=255)
    phone              = models.CharField(max_length=20, blank=True)
    email              = models.EmailField(blank=True)
    district           = models.CharField(max_length=100, blank=True)
    interested_country = models.CharField(max_length=20, choices=COUNTRY_CHOICES, default='australia')
    other_country      = models.CharField(max_length=100, blank=True)
    message            = models.TextField(blank=True)
    user               = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='study_abroad_leads',
    )
    ip_address         = models.GenericIPAddressField(null=True, blank=True)
    submitted_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        country = self.other_country if self.interested_country == 'other' else self.get_interested_country_display()
        return f'{self.name} → {country} ({self.submitted_at.date()})'
