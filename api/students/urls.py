from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, LeaderboardView, XpGrantLogListView

router = DefaultRouter()
# The StudentViewSet handles CRUD for student profiles and adding XP.
# Endpoints: /students/, /students/{id}/, /students/{id}/add-xp/
router.register('profiles', StudentViewSet, basename='student-profile')

urlpatterns = [
    # A dedicated, read-only endpoint for the leaderboard.
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('xp-history/', XpGrantLogListView.as_view(), name='xp-history'),

    # Include the router-generated URLs for student profile management.
    path('', include(router.urls)),
]