from django.db.models.signals import pre_save
from django.dispatch import receiver
from users.models import User

@receiver(pre_save, sender=User)
def assign_school_to_student(sender, instance, **kwargs):
    if instance.role == User.Role.STUDENT and not instance.school_id:
        # If the user is being created by a teacher, assign the teacher's school
        # This assumes the teacher is available in some context (e.g., thread local or request)
        from threading import local
        _thread_locals = local()
        teacher = getattr(_thread_locals, 'current_user', None)
        if teacher and teacher.school_id:
            instance.school = teacher.school 