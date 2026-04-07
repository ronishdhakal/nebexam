from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_add_is_email_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='district',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
