from django.contrib import admin
from .models import StudyAbroadLead


@admin.register(StudyAbroadLead)
class StudyAbroadLeadAdmin(admin.ModelAdmin):
    list_display  = ['name', 'email', 'phone', 'interested_country', 'district', 'submitted_at']
    list_filter   = ['interested_country', 'submitted_at']
    search_fields = ['name', 'email', 'phone', 'district']
    readonly_fields = ['submitted_at', 'ip_address', 'user']
