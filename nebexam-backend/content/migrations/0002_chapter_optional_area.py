from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        # 1. Make area nullable
        migrations.AlterField(
            model_name='chapter',
            name='area',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='chapters',
                to='content.area',
            ),
        ),
        # 2. Add direct subject FK
        migrations.AddField(
            model_name='chapter',
            name='subject',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='direct_chapters',
                to='content.subject',
            ),
        ),
        # 3. Remove old unique_together (area + slug)
        migrations.AlterUniqueTogether(
            name='chapter',
            unique_together=set(),
        ),
        # 4. Make slug globally unique
        migrations.AlterField(
            model_name='chapter',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]
