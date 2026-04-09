from rest_framework import serializers
from .models import StudyAbroadLead


class StudyAbroadLeadSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    class Meta:
        model  = StudyAbroadLead
        fields = [
            'id', 'name', 'phone', 'email', 'district',
            'interested_country', 'other_country', 'message',
            'user_email', 'submitted_at',
        ]
        read_only_fields = ['id', 'submitted_at']

    def validate(self, attrs):
        if attrs.get('interested_country') == 'other' and not attrs.get('other_country', '').strip():
            raise serializers.ValidationError({'other_country': 'Please specify the country name.'})
        return attrs
