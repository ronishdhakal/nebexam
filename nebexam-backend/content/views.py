from django.core.cache import cache
from django.db.models import Q
from django.conf import settings
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subject, Area, Chapter
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
import uuid
import mimetypes
import boto3

from .serializers import (
    SubjectSerializer, SubjectDetailSerializer,
    AreaSerializer, ChapterSerializer, ChapterDetailSerializer, ChapterMinimalSerializer
)
from questionbank.serializers import QuestionNodeSerializer
from nebexam.cache import CachedViewSetMixin, make_cache_key, CACHE_TTL
from nebexam.pagination import OptionalPagination


class SubjectViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    queryset = Subject.objects.order_by('order', 'name')
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'subject_code']
    pagination_class = OptionalPagination

    def get_serializer_class(self):
        if self.action in ('retrieve', 'update', 'partial_update'):
            return SubjectDetailSerializer
        return SubjectSerializer

    def get_queryset(self):
        qs = Subject.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        else:
            is_published = self.request.query_params.get('is_published')
            if is_published == 'true':
                qs = qs.filter(is_published=True)
            elif is_published == 'false':
                qs = qs.filter(is_published=False)
        class_level = self.request.query_params.get('class_level')
        stream = self.request.query_params.get('stream')
        if class_level:
            qs = qs.filter(class_level=class_level)
        if stream:
            qs = qs.filter(streams__icontains=stream)
        return qs


class AreaViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    queryset = Area.objects.select_related('subject').prefetch_related(
        Prefetch('chapters', queryset=Chapter.objects.order_by('order', 'name'))
    ).order_by('order', 'name')
    serializer_class = AreaSerializer
    pagination_class = OptionalPagination

    def get_queryset(self):
        qs = super().get_queryset()
        subject = self.request.query_params.get('subject')
        if subject:
            qs = qs.filter(subject__slug=subject)
        return qs


class ChapterViewSet(CachedViewSetMixin, viewsets.ModelViewSet):
    queryset = Chapter.objects.select_related('area__subject', 'subject').order_by('order', 'name')
    lookup_field = 'slug'
    pagination_class = OptionalPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChapterDetailSerializer
        if self.action == 'list':
            return ChapterMinimalSerializer
        return ChapterSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        else:
            is_published = self.request.query_params.get('is_published')
            if is_published == 'true':
                qs = qs.filter(is_published=True)
            elif is_published == 'false':
                qs = qs.filter(is_published=False)
        area = self.request.query_params.get('area')
        subject = self.request.query_params.get('subject')
        if area:
            qs = qs.filter(area__slug=area)
        if subject:
            qs = qs.filter(Q(area__subject__slug=subject) | Q(subject__slug=subject))
        return qs

    @action(detail=True, methods=['delete'], url_path='remove_pdf')
    def remove_pdf(self, request, slug=None):
        """DELETE — removes the pdf_notes file from a chapter."""
        chapter = self.get_object()
        if chapter.pdf_notes:
            chapter.pdf_notes.delete(save=False)
            chapter.pdf_notes = None
            chapter.save(update_fields=['pdf_notes'])
        cache.clear()
        return Response(ChapterDetailSerializer(chapter).data)

    @action(detail=True, methods=['get'], url_path='important_questions')
    def important_questions(self, request, slug=None):
        key = make_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        chapter = self.get_object()
        questions = (
            chapter.bank_questions
            .filter(parent=None)
            .select_related('entry')
            .order_by('source', 'order')   # manual first, then bank
        )
        serializer = QuestionNodeSerializer(questions, many=True)
        cache.set(key, serializer.data, CACHE_TTL)
        return Response(serializer.data)


class ImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)
        ext = file.name.split('.')[-1]
        filename = f'images/{uuid.uuid4()}.{ext}'
        path = default_storage.save(filename, file)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({'url': url})


def _make_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )


class BucketListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        if not hasattr(settings, 'AWS_STORAGE_BUCKET_NAME'):
            return Response({'error': 'R2 storage not configured.'}, status=503)
        try:
            s3 = _make_s3_client()
            files = []
            paginator = s3.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=settings.AWS_STORAGE_BUCKET_NAME):
                for obj in page.get('Contents', []):
                    key = obj['Key']
                    url = default_storage.url(key)
                    content_type, _ = mimetypes.guess_type(key)
                    files.append({
                        'key': key,
                        'url': url,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'content_type': content_type or 'application/octet-stream',
                    })
            files.sort(key=lambda x: x['last_modified'], reverse=True)
            return Response({'files': files, 'count': len(files)})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class BucketUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=400)
        folder = request.data.get('folder', 'uploads')
        ext = file.name.rsplit('.', 1)[-1] if '.' in file.name else 'bin'
        filename = f'{folder}/{uuid.uuid4()}.{ext}'
        path = default_storage.save(filename, file)
        url = default_storage.url(path)
        content_type, _ = mimetypes.guess_type(path)
        return Response({
            'key': path,
            'url': url,
            'size': file.size,
            'content_type': content_type or 'application/octet-stream',
        })


class BucketDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request):
        if not hasattr(settings, 'AWS_STORAGE_BUCKET_NAME'):
            return Response({'error': 'R2 storage not configured.'}, status=503)
        key = request.data.get('key')
        if not key:
            return Response({'error': 'No key provided.'}, status=400)
        try:
            s3 = _make_s3_client()
            s3.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key)
            return Response({'message': 'File deleted.'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)