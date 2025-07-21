# config/urls.py

from django.contrib import admin
from django.conf import settings
from django.urls import path, include, re_path
from django.views.static import serve
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from django.conf.urls.static import static
from django.views.generic import TemplateView
from users.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- API URL Patterns ---
    path('api/v1/', include([
        # --- Authentication Endpoints ---
        path('auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

        # --- App-Specific URLs ---
        # Includes user management and change password
        path('users/', include('users.urls')),
        
        # Includes student profile management and the leaderboard
        path('students/', include('students.urls')),
        
        # Includes store item management and transactions
        path('store/', include('store.urls')),
    ])),
]

if settings.DEBUG:
    # Serve media files in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Serve media files in production (NOT RECOMMENDED)
    urlpatterns += [
        re_path(r'^(?P<path>uploads/.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        })
    ]

urlpatterns += [
  re_path(r'^.*$', TemplateView.as_view(template_name="index.html"), name='react_app'),
]