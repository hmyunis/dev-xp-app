from rest_framework import serializers
from .models import StoreItem, Transaction
from users.serializers import UserSerializer

class StoreItemSerializer(serializers.ModelSerializer):
    """
    Serializes StoreItem data.
    - Provides a full, absolute URL for the image.
    - The 'image' field is write-only, as the 'imageUrl' is used for responses.
    """
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = StoreItem
        fields = [
            'id', 'name', 'description', 'xp_cost', 'image',
            'image_url', 'stock_quantity', 'is_active', 'created_at'
        ]
        # The raw 'image' field is for upload only.
        extra_kwargs = {
            'image': {'write_only': True, 'required': False}
        }

    def get_image_url(self, obj):
        """
        Returns the absolute URL for the item's image.
        """
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            # build_absolute_uri creates a full URL (e.g., http://.../media/...)
            return request.build_absolute_uri(obj.image.url)
        return None


class TransactionSerializer(serializers.ModelSerializer):
    """
    Provides a detailed, read-only representation of a transaction,
    nesting student and item information for a rich API response.
    """
    student = UserSerializer(read_only=True)
    item = StoreItemSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'student', 'item', 'xp_cost_at_purchase', 'timestamp']


class CreateTransactionSerializer(serializers.Serializer):
    """
    Used by teachers to record a new purchase. It only requires the IDs,
    as the view will handle the transaction logic (checking XP, stock, etc.).
    """
    student_id = serializers.IntegerField(help_text="The ID of the user making the purchase.")
    item_id = serializers.IntegerField(help_text="The ID of the store item being purchased.")