# core/permissions.py

from rest_framework.permissions import BasePermission, IsAdminUser

class IsTeacher(BasePermission):
    """
    Allows access only to users with the 'teacher' role.
    Also allows access to admin users (superusers).
    """
    def has_permission(self, request, view):
        # IsAdminUser will catch superusers
        is_admin = IsAdminUser().has_permission(request, view)
        # Check for teacher role
        is_teacher = bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'TEACHER'
        )
        return is_admin or is_teacher