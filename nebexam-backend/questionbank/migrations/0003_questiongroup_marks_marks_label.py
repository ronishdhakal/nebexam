from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questionbank', '0002_questionnode_passage_title_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='questiongroup',
            name='marks',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='questiongroup',
            name='marks_label',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
