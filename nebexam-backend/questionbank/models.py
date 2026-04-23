from django.db import models
from django.utils.text import slugify
from content.models import Subject, Chapter


class QuestionBankEntry(models.Model):
    class EntryType(models.TextChoices):
        OLD_QUESTION = 'old_question', 'Old Question'
        MODEL_QUESTION = 'model_question', 'Model Question'

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='question_bank_entries')
    type = models.CharField(max_length=20, choices=EntryType.choices)
    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True, blank=True)
    year = models.CharField(max_length=10, blank=True)
    source = models.CharField(max_length=255, blank=True)  # e.g. NEB or College Info Nepal
    sub_code = models.CharField(max_length=10, blank=True)
    disclaimer = models.JSONField(null=True, blank=True)  # Tiptap JSON
    has_disclaimer_2 = models.BooleanField(default=False)
    disclaimer_2 = models.JSONField(null=True, blank=True)
    time = models.CharField(max_length=20, blank=True)  # e.g. '3 hrs'
    full_marks = models.PositiveIntegerField(null=True, blank=True)
    pass_marks = models.PositiveIntegerField(null=True, blank=True)
    has_group = models.BooleanField(default=False)
    is_nepali    = models.BooleanField(default=False)
    has_solution = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', 'subject']

    @staticmethod
    def _build_slug_base(subject_name, entry_type, year):
        subj = slugify(subject_name)
        yr   = slugify(year) if year else ''
        if entry_type == 'model_question':
            return f'{subj}-model-question-{yr}' if yr else f'{subj}-model-question'
        # old_question (and any future types)
        return f'{subj}-question-paper-{yr}' if yr else f'{subj}-question-paper'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = self._build_slug_base(self.subject.name, self.type, self.year)
            slug = base
            n    = 1
            qs   = QuestionBankEntry.objects.exclude(pk=self.pk)
            while qs.filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n   += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.subject.name} {self.get_type_display()} {self.year}'


class QuestionGroup(models.Model):
    entry = models.ForeignKey(QuestionBankEntry, on_delete=models.CASCADE, related_name='groups')
    group_title = models.CharField(max_length=100)  # e.g. 'Group – A'
    group_disclaimer = models.TextField(blank=True)
    marks = models.PositiveIntegerField(null=True, blank=True)       # e.g. 20
    marks_label = models.CharField(max_length=100, blank=True)       # e.g. '5×4=20' or 'Answer any 5'
    marks_formula = models.CharField(max_length=50, blank=True)      # legacy — kept for compat
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.entry} → {self.group_title}'


class QuestionNode(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'mcq', 'MCQ'
        SHORT = 'short', 'Short Answer'
        LONG = 'long', 'Long Answer'
        PASSAGE = 'passage', 'Passage'
        SECTION = 'section', 'Section'
        FILL_BLANK = 'fill_blank', 'Fill in the Blank'
        TRUE_FALSE = 'true_false', 'True/False'
        ESSAY = 'essay', 'Essay'
        LETTER = 'letter', 'Letter'
        GRAMMAR = 'grammar', 'Grammar'
        OR_SEPARATOR = 'or_separator', 'OR Separator'

    class Source(models.TextChoices):
        BANK = 'bank', 'Question Bank'
        MANUAL = 'manual', 'Manually Added'

    entry = models.ForeignKey(
        QuestionBankEntry, on_delete=models.CASCADE, related_name='questions',
        null=True, blank=True
    )
    group = models.ForeignKey(
        QuestionGroup, on_delete=models.CASCADE, related_name='questions',
        null=True, blank=True
    )
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, related_name='children',
        null=True, blank=True
    )
    chapter = models.ForeignKey(
        Chapter, on_delete=models.SET_NULL, related_name='bank_questions',
        null=True, blank=True
    )
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    passage_title = models.CharField(max_length=500, blank=True)  # instruction line above passage
    content = models.JSONField(null=True, blank=True)       # Tiptap JSON
    marks = models.PositiveIntegerField(null=True, blank=True)
    marks_label = models.CharField(max_length=20, blank=True)  # e.g. '5x1=5'
    options = models.JSONField(default=list)                # MCQ only
    answer = models.JSONField(null=True, blank=True)        # Tiptap JSON
    explanation = models.JSONField(null=True, blank=True)   # Tiptap JSON
    source = models.CharField(max_length=10, choices=Source.choices, default=Source.BANK)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.get_question_type_display()} [{self.marks or "?"}m]'