from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyAbroadLead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('district', models.CharField(blank=True, max_length=100)),
                ('interested_country', models.CharField(
                    choices=[
                        ('australia', 'Australia'), ('canada', 'Canada'),
                        ('new_zealand', 'New Zealand'), ('uk', 'United Kingdom'),
                        ('usa', 'United States'), ('other', 'Other'),
                    ],
                    default='australia', max_length=20,
                )),
                ('other_country', models.CharField(blank=True, max_length=100)),
                ('message', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='study_abroad_leads',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-submitted_at']},
        ),
    ]
