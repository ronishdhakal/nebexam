from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0005_payoutrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionplan',
            name='offer_title',
            field=models.CharField(blank=True, help_text='Short offer label, e.g. "Dashain Offer"', max_length=100),
        ),
        migrations.AddField(
            model_name='subscriptionplan',
            name='offer_price',
            field=models.PositiveIntegerField(blank=True, null=True, help_text='Discounted price in NPR; leave blank for no offer'),
        ),
    ]
