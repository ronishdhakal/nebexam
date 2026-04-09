from django.urls import path
from .views import StudyAbroadLeadSubmitView, StudyAbroadLeadListView, StudyAbroadLeadExportView

urlpatterns = [
    path('study-abroad/',        StudyAbroadLeadSubmitView.as_view(), name='lead-submit'),
    path('study-abroad/list/',   StudyAbroadLeadListView.as_view(),   name='lead-list'),
    path('study-abroad/export/', StudyAbroadLeadExportView.as_view(), name='lead-export'),
]
