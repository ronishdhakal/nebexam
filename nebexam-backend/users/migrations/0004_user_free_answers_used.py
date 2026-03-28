from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_passwordresetotp'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='free_answers_used',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
