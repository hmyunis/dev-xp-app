# users/views.py

from rest_framework import viewsets, status, generics
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer, UserCreateSerializer, MyTokenObtainPairSerializer, ChangePasswordSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing users.
    - Full CRUD is restricted to Admin users.
    - Includes a /me/ endpoint for authenticated users to manage their own profile.
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminUser] # Default permission for the ViewSet
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Server-side filtering, searching, and ordering
    search_fields = ['username', 'email', 'full_name', 'phone_number']
    ordering_fields = ['username', 'email', 'full_name', 'role', 'date_joined']

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """An endpoint for the logged-in user to view and update their own profile."""
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(user, data=request.data, partial=request.method == 'PATCH')
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyTokenObtainPairView(TokenObtainPairView):
    """Uses the custom serializer to include role and username in the JWT."""
    serializer_class = MyTokenObtainPairSerializer


class ChangePasswordView(generics.UpdateAPIView):
    """An endpoint for changing the password for the currently authenticated user."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {"error": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)