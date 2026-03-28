from django.contrib import admin
from .models import QuestionBankEntry, QuestionGroup, QuestionNode


@admin.register(QuestionBankEntry)
class QuestionBankEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'type', 'year', 'is_published']
    list_filter = ['type', 'is_published', 'subject']
    search_fields = ['title', 'year']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    list_display = ['group_title', 'entry', 'marks_formula', 'order']


@admin.register(QuestionNode)
class QuestionNodeAdmin(admin.ModelAdmin):
    list_display = ['question_type', 'marks', 'source', 'chapter', 'order']
    list_filter = ['question_type', 'source']