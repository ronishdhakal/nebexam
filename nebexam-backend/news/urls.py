from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewsCategoryViewSet, NewsViewSet,
    BlogCategoryViewSet, BlogViewSet,
    NewsImageUploadView, BlogImageUploadView,
)

router = DefaultRouter()
router.register('news-categories', NewsCategoryViewSet, basename='news-category')
router.register('news', NewsViewSet, basename='news')
router.register('blog-categories', BlogCategoryViewSet, basename='blog-category')
router.register('blog', BlogViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
    path('news/upload-image/', NewsImageUploadView.as_view(), name='news-image-upload'),
    path('blog/upload-image/', BlogImageUploadView.as_view(), name='blog-image-upload'),
]
