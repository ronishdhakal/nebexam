from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_usersession_device_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='crm_status',
            field=models.CharField(
                choices=[('none', 'None'), ('follow_up', 'Follow Up'), ('contacted', 'Contacted'), ('done', 'Done')],
                default='none',
                max_length=20,
            ),
        ),
    ]
