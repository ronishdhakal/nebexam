from rest_framework import viewsets, filters
from .models import QuestionBankEntry, QuestionGroup, QuestionNode
from .serializers import (
    QuestionBankEntrySerializer, QuestionBankEntryDetailSerializer,
    QuestionGroupSerializer, QuestionNodeSerializer
)


class QuestionBankEntryViewSet(viewsets.ModelViewSet):
    queryset = QuestionBankEntry.objects.select_related('subject')
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'year', 'subject__name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuestionBankEntryDetailSerializer
        return QuestionBankEntrySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        subject = self.request.query_params.get('subject')
        entry_type = self.request.query_params.get('type')
        year = self.request.query_params.get('year')
        if subject:
            qs = qs.filter(subject__slug=subject)
        if entry_type:
            qs = qs.filter(type=entry_type)
        if year:
            qs = qs.filter(year=year)
        class_level = self.request.query_params.get('class_level')
        if class_level:
            qs = qs.filter(subject__class_level=class_level)
        return qs


class QuestionGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionGroup.objects.prefetch_related('questions')
    serializer_class = QuestionGroupSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        entry = self.request.query_params.get('entry')
        if entry:
            qs = qs.filter(entry__slug=entry)
        return qs


class QuestionNodeViewSet(viewsets.ModelViewSet):
    queryset = QuestionNode.objects.prefetch_related('children')
    serializer_class = QuestionNodeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        chapter = self.request.query_params.get('chapter')
        entry = self.request.query_params.get('entry')
        parent = self.request.query_params.get('parent')
        if chapter:
            qs = qs.filter(chapter__slug=chapter)
        if entry:
            qs = qs.filter(entry__slug=entry)
        if parent is not None:
            qs = qs.filter(parent_id=parent if parent else None)
        return qs