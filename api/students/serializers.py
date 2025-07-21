from rest_framework import serializers
from .models import StudentProfile
from users.serializers import UserSerializer

class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializes the StudentProfile model.
    Includes nested user data for a comprehensive response.
    """
    # Nest the UserSerializer to include full user details in the profile response.
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['user', 'total_xp', 'available_xp']


class AddXPSerializer(serializers.Serializer):
    """
    A simple serializer to validate the input for the 'add-xp' custom action.
    """
    xp_points = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(
        max_length=255, 
        required=False, 
        allow_blank=True,
        help_text="An optional reason for awarding the XP (e.g., 'Project Completion')."
    )