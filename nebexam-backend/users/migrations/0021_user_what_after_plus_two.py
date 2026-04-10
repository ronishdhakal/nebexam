from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_sitesettings_lead_form'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='what_after_plus_two',
            field=models.CharField(
                blank=True,
                choices=[('study_nepal', 'Study in Nepal'), ('study_abroad', 'Study Abroad')],
                max_length=15,
            ),
        ),
    ]
