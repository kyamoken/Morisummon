import os

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from config.settings import BASE_DIR

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('accounts.urls')),
    path('', include('morisummon.urls')),
    path('', include('battle.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=os.path.join(settings.BASE_DIR, 'static'))
