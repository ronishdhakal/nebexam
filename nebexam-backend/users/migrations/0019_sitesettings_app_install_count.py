from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_alter_user_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='app_install_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
