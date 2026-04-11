from rest_framework import serializers
from .models import PopupAd, TextAd


class PopupAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopupAd
        fields = [
            'id', 'desktop_image', 'mobile_image', 'link',
            'open_in_new_tab', 'is_active', 'is_skippable',
            'skip_after_seconds', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class TextAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextAd
        fields = [
            'id', 'title', 'description', 'link', 'link_text',
            'pages', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
