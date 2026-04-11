from django.contrib import admin
from .models import PopupAd, TextAd


@admin.register(TextAd)
class TextAdAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'link_text', 'pages', 'created_at']
    list_filter = ['is_active']


@admin.register(PopupAd)
class PopupAdAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_active', 'is_skippable', 'skip_after_seconds', 'open_in_new_tab', 'created_at']
    list_filter = ['is_active', 'is_skippable']
