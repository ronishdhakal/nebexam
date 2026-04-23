from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0006_subscriptionplan_offer'),
    ]

    operations = [
        migrations.AddField(
            model_name='coupon',
            name='max_uses',
            field=models.PositiveIntegerField(blank=True, null=True, help_text='Leave blank for unlimited'),
        ),
    ]
