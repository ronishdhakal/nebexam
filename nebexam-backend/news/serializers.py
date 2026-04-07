from rest_framework import serializers
from .models import NewsCategory, News, BlogCategory, Blog


class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ['id', 'name', 'slug', 'order']


class NewsListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = News
        fields = [
            'id', 'slug', 'title', 'excerpt', 'featured_image',
            'category', 'category_name', 'category_slug',
            'is_published', 'published_at', 'created_at', 'updated_at',
        ]


class NewsDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = News
        fields = '__all__'

    def validate(self, attrs):
        # If slug is blank/empty, remove it so the model auto-generates on create
        # or keeps the existing value on update
        if not attrs.get('slug'):
            attrs.pop('slug', None)
        return attrs


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'order']


class BlogListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Blog
        fields = [
            'id', 'slug', 'title', 'excerpt', 'featured_image',
            'category', 'category_name', 'category_slug',
            'is_published', 'published_at', 'created_at', 'updated_at',
        ]


class BlogDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Blog
        fields = '__all__'

    def validate(self, attrs):
        # If slug is blank/empty, remove it so the model auto-generates on create
        # or keeps the existing value on update
        if not attrs.get('slug'):
            attrs.pop('slug', None)
        return attrs
