from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subject, Area, Chapter
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
import uuid

from .serializers import (
    SubjectSerializer, SubjectDetailSerializer,
    AreaSerializer, ChapterSerializer, ChapterDetailSerializer, ChapterMinimalSerializer
)
from questionbank.serializers import QuestionNodeSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'subject_code']

    def get_serializer_class(self):
        if self.action in ('retrieve', 'update', 'partial_update'):
            return SubjectDetailSerializer
        return SubjectSerializer

    def get_queryset(self):
        qs = Subject.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        class_level = self.request.query_params.get('class_level')
        stream = self.request.query_params.get('stream')
        if class_level:
            qs = qs.filter(class_level=class_level)
        if stream:
            qs = qs.filter(streams__icontains=stream)
        return qs


class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.select_related('subject').prefetch_related('chapters')
    lookup_field = 'slug'
    serializer_class = AreaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        subject = self.request.query_params.get('subject')
        if subject:
            qs = qs.filter(subject__slug=subject)
        return qs


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.select_related('area__subject', 'subject')
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChapterDetailSerializer
        if self.action == 'list':
            return ChapterMinimalSerializer
        return ChapterSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        area = self.request.query_params.get('area')
        subject = self.request.query_params.get('subject')
        if area:
            qs = qs.filter(area__slug=area)
        if subject:
            qs = qs.filter(Q(area__subject__slug=subject) | Q(subject__slug=subject))
        return qs

    @action(detail=True, methods=['get'], url_path='important_questions')
    def important_questions(self, request, slug=None):
        chapter = self.get_object()
        questions = (
            chapter.bank_questions
            .filter(parent=None)
            .select_related('entry')
            .order_by('source', 'order')   # manual first, then bank
        )
        serializer = QuestionNodeSerializer(questions, many=True)
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