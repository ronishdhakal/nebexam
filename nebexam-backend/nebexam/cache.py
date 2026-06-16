"""
Shared caching utilities for all DRF views.

Strategy:
- list / retrieve / custom GET actions → cached by URL + staff flag
- create / update / partial_update / destroy / PATCH → clears full cache
- Manual clear available via ClearCacheView (POST /api/users/clear-cache/)

All cache operations are wrapped in try/except so that a cache backend
failure (e.g. file lock contention, corrupted entry) never crashes an
API response — it simply falls through to the database.
"""

import hashlib
import logging
from django.core.cache import cache
from rest_framework.response import Response

logger = logging.getLogger(__name__)

CACHE_TTL = 60 * 60  # 1 hour


def make_cache_key(request):
    raw = '{}:{}:{}'.format(
        request.method,
        request.build_absolute_uri(),
        'staff' if (request.user.is_authenticated and request.user.is_staff) else 'public',
    )
    return 'view:' + hashlib.md5(raw.encode()).hexdigest()


def _cache_get(key):
    try:
        return cache.get(key)
    except Exception as exc:
        logger.warning('cache.get failed for key %s: %s', key, exc)
        return None


def _cache_set(key, value, ttl):
    try:
        cache.set(key, value, ttl)
    except Exception as exc:
        logger.warning('cache.set failed for key %s: %s', key, exc)


def _cache_clear():
    try:
        cache.clear()
    except Exception as exc:
        logger.warning('cache.clear failed: %s', exc)


class CachedViewSetMixin:
    """
    Add to any ModelViewSet to get automatic list/retrieve caching
    and cache invalidation on writes.
    """
    cache_ttl = CACHE_TTL

    # ── reads ──────────────────────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        key = make_cache_key(request)
        cached = _cache_get(key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        _cache_set(key, response.data, self.cache_ttl)
        return response

    def retrieve(self, request, *args, **kwargs):
        key = make_cache_key(request)
        cached = _cache_get(key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        _cache_set(key, response.data, self.cache_ttl)
        return response

    # ── writes (each clears full cache) ────────────────────────────────────

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        _cache_clear()
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        _cache_clear()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        _cache_clear()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        _cache_clear()
        return response
