from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

class StudentProfile(models.Model):
    """
    Stores student-specific data, including their Dev XP points.
    Linked one-to-one with the main User model.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        primary_key=True,
    )
    total_xp = models.PositiveIntegerField(
        default=0,
        help_text=_("Lifetime XP earned for the leaderboard. This value does not decrease.")
    )
    available_xp = models.PositiveIntegerField(
        default=0,
        help_text=_("XP currently available for spending in the Dev Store.")
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        verbose_name = _("Student Profile")
        verbose_name_plural = _("Student Profiles")


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_student_profile(sender, instance, created, **kwargs):
    """
    A signal to automatically create a StudentProfile whenever a new User
    with the 'STUDENT' role is created.
    """
    if created and instance.role == 'STUDENT':
        StudentProfile.objects.create(user=instance)


class XpGrantLog(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='xp_grants'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='xp_grants_given'
    )
    amount = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher} → {self.student}: {self.amount} XP ({self.reason})"