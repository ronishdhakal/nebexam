from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='PopupAd',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('desktop_image', models.ImageField(upload_to='advertisements/desktop/')),
                ('mobile_image', models.ImageField(upload_to='advertisements/mobile/')),
                ('link', models.URLField(blank=True, max_length=500)),
                ('open_in_new_tab', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=False)),
                ('is_skippable', models.BooleanField(default=True)),
                ('skip_after_seconds', models.PositiveIntegerField(default=5)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Popup Ad',
                'verbose_name_plural': 'Popup Ads',
                'ordering': ['-created_at'],
            },
        ),
    ]
