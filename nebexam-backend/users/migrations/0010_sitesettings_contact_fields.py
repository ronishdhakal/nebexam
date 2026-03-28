from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_esewa_enabled'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='contact_email',
            field=models.CharField(blank=True, default='nebexamofficial@gmail.com', max_length=254),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='contact_phone',
            field=models.CharField(blank=True, default='9745450062', max_length=20),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='contact_address',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='contact_wa',
            field=models.CharField(
                blank=True, default='9779745450062', max_length=20,
                help_text='WhatsApp number in international format, e.g. 9779745450062',
            ),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='social_facebook',
            field=models.URLField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='social_instagram',
            field=models.URLField(blank=True, default=''),
        ),
    ]
