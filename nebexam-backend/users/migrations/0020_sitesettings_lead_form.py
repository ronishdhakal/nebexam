from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_sitesettings_app_install_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='lead_form_enabled',
            field=models.BooleanField(default=False, help_text='Show the study abroad lead form on Class 12 chapter pages.'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='lead_form_title',
            field=models.CharField(blank=True, default='Planning to Study Abroad?', max_length=255),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='lead_form_image',
            field=models.ImageField(blank=True, null=True, upload_to='lead_form/'),
        ),
    ]
