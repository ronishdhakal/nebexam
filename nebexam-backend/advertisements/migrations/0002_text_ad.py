from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advertisements', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TextAd',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('link', models.URLField(blank=True, max_length=500)),
                ('link_text', models.CharField(default='Apply Now', max_length=80)),
                ('pages', models.JSONField(default=list)),
                ('is_active', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Text Ad',
                'verbose_name_plural': 'Text Ads',
                'ordering': ['-created_at'],
            },
        ),
    ]
