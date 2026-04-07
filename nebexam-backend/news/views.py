import uuid
from nebexam.cache import CachedViewSetMixin
from nebexam.pagination import StandardPagination
from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage

from .models import NewsCategory, News, BlogCategory, Blog
from .serializers import (
    NewsCategorySerializer, NewsListSerializer, NewsDetailSerializer,
    BlogCategorySerializer, BlogListSerializer, BlogDetailSerializer,
)


class NewsCategoryViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]


class NewsViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt']
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action in ('retrieve', 'create', 'update', 'partial_update'):
            return NewsDetailSerializer
        return NewsListSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = News.objects.select_related('category')
        is_admin = self.request.user.is_authenticated and self.request.user.is_staff
        if not is_admin:
            qs = qs.filter(is_published=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        if is_admin:
            published = self.request.query_params.get('is_published')
            if published == 'true':
                qs = qs.filter(is_published=True)
            elif published == 'false':
                qs = qs.filter(is_published=False)
        return qs.order_by('-created_at')


class BlogCategoryViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]


class BlogViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt']
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action in ('retrieve', 'create', 'update', 'partial_update'):
            return BlogDetailSerializer
        return BlogListSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Blog.objects.select_related('category')
        is_admin = self.request.user.is_authenticated and self.request.user.is_staff
        if not is_admin:
            qs = qs.filter(is_published=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        if is_admin:
            published = self.request.query_params.get('is_published')
            if published == 'true':
                qs = qs.filter(is_published=True)
            elif published == 'false':
                qs = qs.filter(is_published=False)
        return qs.order_by('-created_at')


class NewsImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)
        ext = file.name.rsplit('.', 1)[-1].lower()
        filename = f'news/images/{uuid.uuid4()}.{ext}'
        path = default_storage.save(filename, file)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({'url': url})


class BlogImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)
        ext = file.name.rsplit('.', 1)[-1].lower()
        filename = f'blog/images/{uuid.uuid4()}.{ext}'
        path = default_storage.save(filename, file)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({'url': url})
