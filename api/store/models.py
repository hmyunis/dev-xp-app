import os
from django.core.files.storage import default_storage
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from dev_xp_camp.utils import get_upload_path
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image as PilImage
import uuid

def store_image_upload_path(instance, filename):
    """Generates a unique path for uploaded store item images."""
    return f'store_items/{instance.id or "new"}/{filename}'

class StoreItem(models.Model):
    """
    Represents an item available for purchase in the Dev Store.
    Shared across all schools.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    xp_cost = models.PositiveIntegerField(help_text=_("The price of the item in XP."))
    
    # Using FileField as requested, to handle blobs or any file type from the frontend.
    image = models.FileField(upload_to=get_upload_path, null=True, blank=True)
    
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

    def save(self, *args, **kwargs):
        # Delete old file if updating the image
        if self.pk:
            old = StoreItem.objects.filter(pk=self.pk).first()
            if old and old.image and self.image != old.image:
                if default_storage.exists(old.image.name):
                    default_storage.delete(old.image.name)
        # Image compression logic
        if self.image and hasattr(self.image.file, 'content_type'):
            try:
                img = PilImage.open(self.image)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=85, optimize=True)
                model_name = self.__class__.__name__.lower()
                new_filename = f'{uuid.uuid4()}.jpg'
                path = os.path.join('uploads', model_name, new_filename)
                self.image.save(path, ContentFile(buffer.getvalue()), save=False)
            except Exception:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the file from storage when the object is deleted
        if self.image and default_storage.exists(self.image.name):
            default_storage.delete(self.image.name)
        super().delete(*args, **kwargs)


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
    school = models.ForeignKey(
        'users.School',
        on_delete=models.CASCADE,
        related_name='transactions',
    )

    def __str__(self):
        return f"Transaction: {self.student.username} bought {self.item.name} on {self.timestamp.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")