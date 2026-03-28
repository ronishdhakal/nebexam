from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionBankEntryViewSet, QuestionGroupViewSet, QuestionNodeViewSet

router = DefaultRouter()
router.register('entries', QuestionBankEntryViewSet, basename='entry')
router.register('groups', QuestionGroupViewSet, basename='group')
router.register('nodes', QuestionNodeViewSet, basename='node')

urlpatterns = [path('', include(router.urls))]