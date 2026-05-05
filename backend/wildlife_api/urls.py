"""
URL configuration for wildlife_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from accounts.admin_views import AdminStatsView
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/images/', include('images.urls')),
    path('api/training/', include('training.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('api/model-management/', include('model_management.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    path('model-artifacts/<path:path>', serve, {
        'document_root': os.path.join(settings.BASE_DIR, '..', 'models', 'trained_models')
    }),
]