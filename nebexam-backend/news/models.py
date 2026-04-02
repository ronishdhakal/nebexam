from django.db import models
from django.utils.text import slugify


class NewsCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'News Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            n = 1
            while NewsCategory.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)


class News(models.Model):
    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True, blank=True, max_length=600)
    excerpt = models.TextField(blank=True)
    content = models.JSONField(null=True, blank=True)
    featured_image = models.ImageField(upload_to='news/images/', null=True, blank=True)
    category = models.ForeignKey(
        NewsCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='news'
    )
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'News'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:590]
            slug = base
            n = 1
            while News.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Blog Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            n = 1
            while BlogCategory.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Blog(models.Model):
    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True, blank=True, max_length=600)
    excerpt = models.TextField(blank=True)
    content = models.JSONField(null=True, blank=True)
    featured_image = models.ImageField(upload_to='blog/images/', null=True, blank=True)
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs'
    )
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:590]
            slug = base
            n = 1
            while Blog.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)
