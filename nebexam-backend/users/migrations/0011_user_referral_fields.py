import random
import string

from django.db import migrations, models


def generate_unique_code(existing):
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=8))
        if code not in existing:
            return code


def populate_referral_codes(apps, schema_editor):
    User = apps.get_model('users', 'User')
    existing = set()
    users = list(User.objects.all())
    for user in users:
        code = generate_unique_code(existing)
        existing.add(code)
        user.referral_code = code
    User.objects.bulk_update(users, ['referral_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_sitesettings_contact_fields'),
    ]

    operations = [
        # Step 1: add as nullable, no unique yet
        migrations.AddField(
            model_name='user',
            name='referral_code',
            field=models.CharField(max_length=10, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='referral_balance',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        # Step 2: populate unique codes for all existing rows
        migrations.RunPython(populate_referral_codes, migrations.RunPython.noop),
        # Step 3: enforce unique + non-nullable
        migrations.AlterField(
            model_name='user',
            name='referral_code',
            field=models.CharField(max_length=10, unique=True, blank=True),
        ),
    ]
