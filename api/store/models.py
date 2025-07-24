from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

def store_image_upload_path(instance, filename):
    """Generates a unique path for uploaded store item images."""
    return f'store_items/{instance.id or "new"}/{filename}'

class StoreItem(models.Model):
    """
    Represents an item available for purchase in the Dev Store.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    xp_cost = models.PositiveIntegerField(help_text=_("The price of the item in XP."))
    
    # Using FileField as requested, to handle blobs or any file type from the frontend.
    image = models.FileField(upload_to=store_image_upload_path, null=True, blank=True)
    
    stock_quantity = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(
        default=True,
        help_text=_("Uncheck this to hide the item from the student store view.")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.xp_cost} XP)"

    class Meta:
        ordering = ['xp_cost', 'name']
        verbose_name = _("Store Item")
        verbose_name_plural = _("Store Items")


class Transaction(models.Model):
    """
    Logs every purchase made by a student, creating an immutable record.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    item = models.ForeignKey(
        StoreItem,
        on_delete=models.PROTECT, # Prevent deleting an item if it has been purchased
        related_name='transactions'
    )
    xp_cost_at_purchase = models.PositiveIntegerField(
        help_text=_("The XP cost of the item at the time of the transaction.")
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction: {self.student.username} bought {self.item.name} on {self.timestamp.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")