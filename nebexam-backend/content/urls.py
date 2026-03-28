from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, AreaViewSet, ChapterViewSet, ImageUploadView

router = DefaultRouter()
router.register('subjects', SubjectViewSet, basename='subject')
router.register('areas', AreaViewSet, basename='area')
router.register('chapters', ChapterViewSet, basename='chapter')

urlpatterns = [
    path('', include(router.urls)),
    path('upload-image/', ImageUploadView.as_view(), name='upload-image'),
]