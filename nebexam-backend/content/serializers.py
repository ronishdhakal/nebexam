from rest_framework import serializers
from .models import Subject, Area, Chapter


class ChapterMinimalSerializer(serializers.ModelSerializer):
    """Lightweight serializer for sidebar/list use — omits heavy content fields."""
    area_name = serializers.SerializerMethodField()

    def get_area_name(self, obj):
        return obj.area.name if obj.area else None

    class Meta:
        model = Chapter
        fields = ['id', 'slug', 'name', 'order', 'area_name', 'is_published']
        extra_kwargs = {'slug': {'read_only': True}}


class ChapterSerializer(serializers.ModelSerializer):
    area_name = serializers.SerializerMethodField()

    def get_area_name(self, obj):
        return obj.area.name if obj.area else None

    class Meta:
        model = Chapter
        fields = ['id', 'area', 'subject', 'area_name', 'slug', 'name', 'order', 'rich_text_notes', 'pdf_notes', 'is_published']
        extra_kwargs = {'slug': {'read_only': True}}


class ChapterDetailSerializer(serializers.ModelSerializer):
    area_name = serializers.SerializerMethodField()
    area_slug = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    subject_slug = serializers.SerializerMethodField()
    subject_class_level = serializers.SerializerMethodField()

    def _subj(self, obj):
        return obj.area.subject if obj.area else obj.subject

    def get_area_name(self, obj):        return obj.area.name if obj.area else None
    def get_area_slug(self, obj):        return obj.area.slug if obj.area else None
    def get_subject_name(self, obj):     s = self._subj(obj); return s.name if s else None
    def get_subject_slug(self, obj):     s = self._subj(obj); return s.slug if s else None
    def get_subject_class_level(self, obj): s = self._subj(obj); return s.class_level if s else None

    class Meta:
        model = Chapter
        fields = '__all__'


class AreaSerializer(serializers.ModelSerializer):
    chapters = ChapterMinimalSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_class_level = serializers.CharField(source='subject.class_level', read_only=True)

    class Meta:
        model = Area
        fields = ['id', 'subject', 'subject_name', 'subject_class_level', 'slug', 'name', 'order', 'chapters']
        extra_kwargs = {'slug': {'read_only': True}}


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'slug', 'subject_code', 'name', 'class_level', 'streams', 'order', 'is_published', 'book_text', 'book_pdf']
        extra_kwargs = {'slug': {'required': False}}


class SubjectDetailSerializer(serializers.ModelSerializer):
    areas = AreaSerializer(many=True, read_only=True)
    direct_chapters = ChapterSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = '__all__'