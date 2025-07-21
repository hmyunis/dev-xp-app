# students/views.py

from django.db import transaction
from rest_framework import viewsets, status, generics
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import StudentProfile
from .serializers import StudentProfileSerializer, AddXPSerializer
from core.permissions import IsTeacher

class StudentViewSet(viewsets.ModelViewSet):
    """
    For Teachers: Manage student profiles.
    This includes viewing, editing, and adding XP.
    Students cannot be created directly here; a User is created, which triggers profile creation.
    """
    queryset = StudentProfile.objects.select_related('user').all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsTeacher]
    lookup_field = 'user_id' # Use user ID for lookups, e.g., /students/profiles/5/

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['user__username', 'user__full_name', 'user__email']
    ordering_fields = ['user__full_name', 'total_xp', 'available_xp']

    @action(detail=True, methods=['post'], url_path='add-xp', serializer_class=AddXPSerializer)
    def add_xp(self, request, user_id=None):
        """
        Custom action for a teacher to add XP to a specific student's profile.
        """
        profile = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        xp_to_add = serializer.validated_data['xp_points']

        # Use an atomic transaction to ensure data integrity
        with transaction.atomic():
            profile.total_xp += xp_to_add
            profile.available_xp += xp_to_add
            profile.save()
        
        response_serializer = StudentProfileSerializer(profile, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class LeaderboardView(generics.ListAPIView):
    """
    A read-only endpoint for viewing the student leaderboard.
    Accessible by any authenticated user (students and teachers).
    Ranked by total XP.
    """
    queryset = StudentProfile.objects.select_related('user').order_by('-total_xp', 'user__full_name')
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]