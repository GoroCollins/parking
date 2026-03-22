from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    return JsonResponse({'status': 'Healthy'})

urlpatterns = [
    path('parkingadm/', admin.site.urls),
    # Healthcheck endpoint
    path('api/v1/health/', health_check, name='health_check'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
