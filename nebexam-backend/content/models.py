from django.db import models
from django.utils.text import slugify


class Subject(models.Model):
    class ClassLevel(models.TextChoices):
        CLASS_8  = '8',  'Class 8'
        CLASS_9  = '9',  'Class 9'
        CLASS_10 = '10', 'Class 10'
        CLASS_11 = '11', 'Class 11'
        CLASS_12 = '12', 'Class 12'

    class Stream(models.TextChoices):
        SCIENCE = 'science', 'Science'
        MANAGEMENT = 'management', 'Management'

    subject_code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    class_level = models.CharField(max_length=2, choices=ClassLevel.choices)
    streams = models.JSONField(default=list)  # e.g. ['science'] or ['science', 'management']
    syllabus = models.JSONField(null=True, blank=True)  # Tiptap JSON
    syllabus_university = models.CharField(max_length=255, blank=True)
    syllabus_full_mark  = models.PositiveIntegerField(null=True, blank=True)
    syllabus_pass_mark  = models.PositiveIntegerField(null=True, blank=True)
    syllabus_time       = models.CharField(max_length=100, blank=True)  # e.g. "3 hours"
    book_text = models.JSONField(null=True, blank=True)  # Tiptap JSON — textbook rich text
    book_pdf = models.FileField(upload_to='subject_books/', null=True, blank=True)
    order = models.PositiveIntegerField(default=999)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f'{self.name}-class-{self.class_level}')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} (Class {self.class_level})'


class Area(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='areas')
    name = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    order = models.PositiveIntegerField(default=999)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['subject', 'slug']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.subject.name} → {self.name}'


class Chapter(models.Model):
    # A chapter belongs to EITHER an area OR directly to a subject (not both).
    area = models.ForeignKey(
        Area, null=True, blank=True,
        on_delete=models.CASCADE, related_name='chapters'
    )
    subject = models.ForeignKey(
        Subject, null=True, blank=True,
        on_delete=models.CASCADE, related_name='direct_chapters'
    )
    name = models.CharField(max_length=955)
    slug = models.SlugField(blank=True, unique=True)
    order = models.PositiveIntegerField(default=999)
    rich_text_notes = models.JSONField(null=True, blank=True)  # Tiptap JSON
    pdf_notes = models.FileField(upload_to='chapter_pdfs/', null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.area and not self.subject:
            raise ValidationError('Chapter must belong to either an area or a subject directly.')
        if self.area and self.subject:
            raise ValidationError('Chapter cannot belong to both an area and a subject simultaneously.')

    def _get_subject(self):
        return self.area.subject if self.area else self.subject

    def save(self, *args, **kwargs):
        if not self.slug:
            subj = self._get_subject()
            prefix = slugify(subj.name) if subj else ''
            base = f'{prefix}-{slugify(self.name)}' if prefix else slugify(self.name)
            slug, n = base, 1
            while Chapter.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        if self.area:
            return f'{self.area.subject.name} → {self.area.name} → {self.name}'
        return f'{self.subject.name} → {self.name}'