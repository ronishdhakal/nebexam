"""
Shared caching utilities for all DRF views.

Strategy:
- list / retrieve / custom GET actions → cached by URL + staff flag
- create / update / partial_update / destroy / PATCH → clears full cache
- Manual clear available via ClearCacheView (POST /api/users/clear-cache/)
"""

import hashlib
from django.core.cache import cache
from rest_framework.response import Response

CACHE_TTL = 60 * 60  # 1 hour


def make_cache_key(request):
    """MD5 of method + absolute URL + staff flag → short, safe cache key."""
    raw = '{}:{}:{}'.format(
        request.method,
        request.build_absolute_uri(),
        'staff' if (request.user.is_authenticated and request.user.is_staff) else 'public',
    )
    return 'view:' + hashlib.md5(raw.encode()).hexdigest()


class CachedViewSetMixin:
    """
    Add to any ModelViewSet to get automatic list/retrieve caching
    and cache invalidation on writes.
    """
    cache_ttl = CACHE_TTL

    # ── reads ──────────────────────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        key = make_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(key, response.data, self.cache_ttl)
        return response

    def retrieve(self, request, *args, **kwargs):
        key = make_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        cache.set(key, response.data, self.cache_ttl)
        return response

    # ── writes (each clears full cache) ────────────────────────────────────

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        cache.clear()
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        cache.clear()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        cache.clear()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        cache.clear()
        return response
