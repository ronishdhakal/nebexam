from django.contrib import admin
from .models import NewsCategory, News, BlogCategory, Blog


@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'created_at']
    list_filter = ['is_published', 'category']
    search_fields = ['title', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'created_at']
    list_filter = ['is_published', 'category']
    search_fields = ['title', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
