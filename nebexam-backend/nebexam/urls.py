import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.http import Http404, JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def media_serve(request, path):
    """Serve media files, checking MEDIA_ROOT then MEDIA_ROOT/uploads as fallback."""
    for root in [settings.MEDIA_ROOT, settings.MEDIA_ROOT / 'uploads']:
        full_path = os.path.join(root, path)
        if os.path.exists(full_path):
            return serve(request, path, document_root=root)
    raise Http404


def health_check(request):
    """No-auth, no-DB ping — use to verify the backend is reachable and CORS is working."""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/content/', include('content.urls')),
    path('api/questionbank/', include('questionbank.urls')),
    path('api/', include('news.urls')),
    path('api/leads/', include('leads.urls')),
    path('api/advertisements/', include('advertisements.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    re_path(r'^uploads/(?P<path>.*)$', media_serve),
]
