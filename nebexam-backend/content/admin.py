from django.contrib import admin
from .models import Subject, Area, Chapter


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['subject_code', 'name', 'class_level', 'streams', 'is_published']
    list_filter = ['class_level', 'is_published']
    search_fields = ['name', 'subject_code']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'order']
    list_filter = ['subject']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['name', 'area', 'order', 'is_published']
    list_filter = ['area__subject', 'is_published']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}