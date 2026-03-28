import django.db.models.deletion
from django.db import migrations, models


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model('payments', 'SubscriptionPlan')
    defaults = [
        {'tier': '1month', 'label': '1 Month',  'amount': 100, 'months': 1},
        {'tier': '3month', 'label': '3 Months', 'amount': 200, 'months': 3},
        {'tier': '1year',  'label': '1 Year',   'amount': 300, 'months': 12},
    ]
    for d in defaults:
        SubscriptionPlan.objects.get_or_create(tier=d['tier'], defaults=d)


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubscriptionPlan',
            fields=[
                ('id',     models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tier',   models.CharField(choices=[('1month', '1 Month'), ('3month', '3 Months'), ('1year', '1 Year')], max_length=10, unique=True)),
                ('label',  models.CharField(max_length=50)),
                ('amount', models.PositiveIntegerField(help_text='Price in NPR')),
                ('months', models.PositiveSmallIntegerField(help_text='Duration in months')),
            ],
            options={'ordering': ['months']},
        ),
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('id',               models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',             models.CharField(max_length=255, help_text='Recipient/person name')),
                ('purpose',          models.CharField(blank=True, max_length=255)),
                ('code',             models.CharField(max_length=50, unique=True)),
                ('discount_percent', models.PositiveSmallIntegerField(help_text='1–100')),
                ('is_active',        models.BooleanField(default=True)),
                ('created_at',       models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddField(
            model_name='payment',
            name='coupon',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='payments.coupon'),
        ),
        migrations.RunPython(seed_plans, migrations.RunPython.noop),
    ]
