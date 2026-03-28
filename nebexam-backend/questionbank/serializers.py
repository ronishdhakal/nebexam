from rest_framework import serializers
from .models import QuestionBankEntry, QuestionGroup, QuestionNode


class QuestionNodeSerializer(serializers.ModelSerializer):
    children    = serializers.SerializerMethodField()
    entry_year  = serializers.SerializerMethodField()
    entry_type  = serializers.SerializerMethodField()

    class Meta:
        model = QuestionNode
        fields = [
            'id', 'entry', 'group', 'parent', 'question_type',
            'passage_title', 'content', 'marks', 'marks_label',
            'options', 'answer', 'explanation', 'chapter', 'source',
            'order', 'children', 'entry_year', 'entry_type',
        ]

    def get_children(self, obj):
        children = obj.children.all().order_by('order')
        return QuestionNodeSerializer(children, many=True).data

    def get_entry_year(self, obj):
        if obj.entry_id and obj.entry:
            return obj.entry.year or None
        return None

    def get_entry_type(self, obj):
        if obj.entry_id and obj.entry:
            return obj.entry.type or None
        return None


class QuestionGroupSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = QuestionGroup
        fields = ['id', 'entry', 'group_title', 'group_disclaimer', 'marks', 'marks_label', 'marks_formula', 'order', 'questions']

    def get_questions(self, obj):
        root_nodes = obj.questions.filter(parent__isnull=True).order_by('order')
        return QuestionNodeSerializer(root_nodes, many=True).data


class QuestionBankEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_slug = serializers.CharField(source='subject.slug', read_only=True)

    class Meta:
        model = QuestionBankEntry
        fields = [
            'id', 'slug', 'subject', 'subject_name', 'subject_slug', 'type', 'title', 'year', 'source',
            'sub_code', 'time', 'full_marks', 'pass_marks', 'has_group', 'is_nepali', 'is_published'
        ]


class QuestionBankEntryDetailSerializer(serializers.ModelSerializer):
    groups = QuestionGroupSerializer(many=True, read_only=True)
    questions = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_slug = serializers.CharField(source='subject.slug', read_only=True)

    class Meta:
        model = QuestionBankEntry
        fields = '__all__'

    def get_questions(self, obj):
        root_nodes = obj.questions.filter(parent__isnull=True).order_by('order')
        return QuestionNodeSerializer(root_nodes, many=True).data