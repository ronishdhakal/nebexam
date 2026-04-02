import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_coupon_subscriptionplan'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='referred_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='referral_payments',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name='ReferralReward',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reward_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(
                    choices=[('pending', 'Pending'), ('released', 'Released')],
                    default='pending',
                    max_length=10,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('released_at', models.DateTimeField(blank=True, null=True)),
                ('referrer', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='referral_rewards_earned',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('referee', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='referral_rewards_given',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('payment', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='referral_reward',
                    to='payments.payment',
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
