import os
import uuid

def get_upload_path(instance, filename):
    """Generates a unique path for file uploads."""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    # This will return a path like 'uploads/model_name/the_uuid.ext'
    return os.path.join('uploads', instance.__class__.__name__.lower(), filename)