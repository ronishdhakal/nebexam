from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questionbank', '0005_alter_questionnode_question_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='questionbankentry',
            name='has_solution',
            field=models.BooleanField(default=False),
        ),
    ]
