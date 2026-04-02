from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_user_referral_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersession',
            name='device_id',
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
