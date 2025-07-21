from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import StoreItem, Transaction
from .serializers import StoreItemSerializer, TransactionSerializer, CreateTransactionSerializer
from students.models import StudentProfile
from core.permissions import IsTeacher

class StoreItemViewSet(viewsets.ModelViewSet):
    """
    Manages items in the Dev Store.
    - Teachers have full CRUD access.
    - Students have read-only access to active, in-stock items.
    """
    queryset = StoreItem.objects.all().order_by('xp_cost')
    serializer_class = StoreItemSerializer
    
    # Server-side filtering for store browsing
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'xp_cost', 'stock_quantity']

    def get_permissions(self):
        """Dynamically set permissions based on the action."""
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsTeacher]
        return super().get_permissions()

    def get_queryset(self):
        """
        Dynamically filter the queryset based on the user's role.
        """
        user = self.request.user
        if user.is_authenticated and user.role == 'STUDENT':
            # Students only see active items that are in stock
            return super().get_queryset().filter(is_active=True, stock_quantity__gt=0)
        # Teachers see all items
        return super().get_queryset()


class TransactionViewSet(mixins.CreateModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.ListModelMixin,
                         viewsets.GenericViewSet):
    """
    For Teachers & Students: Create and view transaction records.
    This is not a full ModelViewSet because transactions should be immutable (no update/delete).
    """
    queryset = Transaction.objects.select_related('student', 'item').all()
    permission_classes = [IsAuthenticated]
    
    # Server-side filtering for the transactions log
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {'student__id': ['exact'], 'item__id': ['exact'], 'timestamp': ['gte', 'lte']}
    search_fields = ['student__username', 'item__name']
    ordering_fields = ['timestamp', 'student__username', 'item__name']

    def get_serializer_class(self):
        """Use a different serializer for creating vs. reading transactions."""
        if self.action == 'create':
            return CreateTransactionSerializer
        return TransactionSerializer

    def create(self, request, *args, **kwargs):
        """Handles the logic for a student purchasing an item."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        student_id = serializer.validated_data['student_id']
        item_id = serializer.validated_data['item_id']

        student_profile = get_object_or_404(StudentProfile, user_id=student_id)
        item = get_object_or_404(StoreItem, id=item_id)

        # --- Business Logic Validations ---
        if not item.is_active or item.stock_quantity <= 0:
            return Response({"error": "This item is no longer available."}, status=status.HTTP_400_BAD_REQUEST)
        
        if student_profile.available_xp < item.xp_cost:
            return Response({"error": "Student does not have enough available XP."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Perform Purchase in an Atomic Transaction ---
        with transaction.atomic():
            # 1. Decrement student's available XP (total_xp is untouched)
            student_profile.available_xp -= item.xp_cost
            student_profile.save()

            # 2. Decrement item stock
            item.stock_quantity -= 1
            item.save()

            # 3. Create the immutable transaction record
            transaction_record = Transaction.objects.create(
                student=student_profile.user,
                item=item,
                xp_cost_at_purchase=item.xp_cost
            )
        
        # Return the created transaction record using the detailed serializer
        response_serializer = TransactionSerializer(transaction_record, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)