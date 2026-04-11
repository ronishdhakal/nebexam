from django.db import models

PAGE_CHOICES = [
    ('homepage', 'Homepage'),
    ('class-8',  'Class 8'),
    ('class-9',  'Class 9'),
    ('class-10', 'Class 10'),
    ('class-11', 'Class 11'),
    ('class-12', 'Class 12'),
]


class TextAd(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    link = models.URLField(max_length=500, blank=True)
    link_text = models.CharField(max_length=80, default='Apply Now')
    # pages stored as JSON array, e.g. ["homepage", "class-10"]
    pages = models.JSONField(default=list)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Text Ad'
        verbose_name_plural = 'Text Ads'

    def __str__(self):
        status = 'Active' if self.is_active else 'Inactive'
        return f'{self.title} ({status})'


class PopupAd(models.Model):
    desktop_image = models.ImageField(upload_to='advertisements/desktop/')
    mobile_image = models.ImageField(upload_to='advertisements/mobile/')
    link = models.URLField(max_length=500, blank=True)
    open_in_new_tab = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)
    is_skippable = models.BooleanField(default=True)
    skip_after_seconds = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Popup Ad'
        verbose_name_plural = 'Popup Ads'

    def __str__(self):
        status = 'Active' if self.is_active else 'Inactive'
        return f'Popup Ad #{self.pk} ({status})'

    def save(self, *args, **kwargs):
        # Ensure only one ad is active at a time
        if self.is_active:
            PopupAd.objects.exclude(pk=self.pk).filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)
