"""
Management command to regenerate all QuestionBankEntry slugs using the
clean format:
  old_question   → {subject}-question-paper-{year}
  model_question → {subject}-model-question-{year}

Usage:
    python manage.py reslug_entries
    python manage.py reslug_entries --dry-run
"""

from django.core.management.base import BaseCommand
from questionbank.models import QuestionBankEntry


class Command(BaseCommand):
    help = 'Regenerate QuestionBankEntry slugs in the clean SEO format'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Print what would change without saving',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        entries = QuestionBankEntry.objects.select_related('subject').order_by('id')
        seen = {}  # slug → pk, to detect collisions within this run

        changed = 0
        for entry in entries:
            base = QuestionBankEntry._build_slug_base(
                entry.subject.name, entry.type, entry.year
            )
            slug = base
            n = 1
            # avoid collision with *other* entries (not self)
            while QuestionBankEntry.objects.exclude(pk=entry.pk).filter(slug=slug).exists() \
                    or (slug in seen and seen[slug] != entry.pk):
                slug = f'{base}-{n}'
                n += 1

            seen[slug] = entry.pk

            if slug != entry.slug:
                self.stdout.write(
                    f'  [{entry.pk}] {entry.slug!r}  ->  {slug!r}'
                )
                if not dry_run:
                    entry.slug = slug
                    entry.save(update_fields=['slug'])
                changed += 1

        label = 'Would update' if dry_run else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'\n{label} {changed} of {entries.count()} entries.'
        ))
