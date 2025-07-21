# users/models.py

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where username is the unique identifier.
    """
    def create_user(self, username, password=None, **extra_fields):
        """
        Create and save a User with the given username and password.
        """
        if not username:
            raise ValueError(_('The Username must be set'))
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        """
        Create and save a Superuser with the given username and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.TEACHER) # Superuser is a Teacher

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        if extra_fields.get('role') != User.Role.TEACHER:
            raise ValueError(_('Superuser must have role of Teacher.'))
            
        return self.create_user(username, password, **extra_fields)

class User(AbstractUser):
    """
    Custom User model for the camp.
    Inherits from AbstractUser to leverage Django's auth system.
    """
    class Role(models.TextChoices):
        STUDENT = "STUDENT", _("Student")
        TEACHER = "TEACHER", _("Teacher")

    # Fields for your application
    full_name = models.CharField(_("full name"), max_length=255, blank=True)
    email = models.EmailField(_("email address"), unique=True, null=True, blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)
    phone_number = models.CharField(_("phone number"), max_length=20, blank=True)

    objects = CustomUserManager()

    # username, password, is_staff, is_active, date_joined etc. are inherited from AbstractUser

    def __str__(self):
        return self.username