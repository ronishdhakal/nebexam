from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PopupAdViewSet, ActivePopupAdView, TextAdViewSet, ActiveTextAdsView

router = DefaultRouter()
router.register('popup-ads', PopupAdViewSet, basename='popup-ad')
router.register('text-ads', TextAdViewSet, basename='text-ad')

urlpatterns = [
    path('', include(router.urls)),
    path('active-popup-ad/', ActivePopupAdView.as_view(), name='active-popup-ad'),
    path('active-text-ads/', ActiveTextAdsView.as_view(), name='active-text-ads'),
]
