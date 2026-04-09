from rest_framework import serializers
from .models import StudyAbroadLead


class StudyAbroadLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StudyAbroadLead
        fields = [
            'id', 'name', 'phone', 'email', 'district',
            'interested_country', 'other_country', 'message',
            'user', 'submitted_at',
        ]
        read_only_fields = ['id', 'user', 'submitted_at']

    def validate(self, attrs):
        if attrs.get('interested_country') == 'other' and not attrs.get('other_country', '').strip():
            raise serializers.ValidationError({'other_country': 'Please specify the country name.'})
        return attrs
