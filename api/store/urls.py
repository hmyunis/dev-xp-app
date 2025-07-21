# store/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreItemViewSet, TransactionViewSet

router = DefaultRouter()
# Manages store items (CRUD for teachers, Read-only for students)
router.register('items', StoreItemViewSet, basename='store-item')
# Manages transactions (Create/Read for teachers)
router.register('transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # This will include all URLs from the router.
    # e.g., /store/items/, /store/transactions/
    path('', include(router.urls)),
]