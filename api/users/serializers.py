from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for reading and updating user information.
    The 'role' is read-only here to prevent users from changing their own role.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 
            'phone_number', 'role', 'last_login', 'date_joined'
        ]
        read_only_fields = ['role', 'last_login', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users (students or teachers) by an admin/teacher.
    """
    # Make password write-only so it's not included in the response.
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'full_name', 'email', 'phone_number', 'role']

    def create(self, validated_data):
        request = self.context.get('request')
        school = None
        if request and hasattr(request, 'user') and request.user and request.user.school_id:
            school = request.user.school
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            email=validated_data.get('email'),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', User.Role.STUDENT),
            school=school
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT token payload to include user's role and username.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['fullName'] = user.full_name
        return token


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for the password change endpoint.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"newPassword": "New password and confirmation password do not match."}
            )
        return attrs