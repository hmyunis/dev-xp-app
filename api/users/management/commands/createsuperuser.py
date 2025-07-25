# users/management/commands/createsuperuser.py

from django.contrib.auth.management.commands.createsuperuser import Command as BaseCreateSuperuserCommand
from users.models import School
from django.core.management.base import CommandError

class Command(BaseCreateSuperuserCommand):
    def handle(self, *args, **options):
        # 1. Prompt for your custom field (school) first.
        if not School.objects.exists():
            School.objects.get_or_create(name="Moonlight Academy", code="moonlight")
            School.objects.get_or_create(name="Nejashi Academy", code="nejashi")
        schools = School.objects.all()
        print("Available schools:")
        for school in schools:
            print(f"  {school.id}: {school.name} ({school.code})")
        
        school = None
        while school is None:
            school_id = input("Enter school id for this superuser: ").strip()
            try:
                school = School.objects.get(id=school_id)
            except (School.DoesNotExist, ValueError):
                self.stderr.write(f"Error: School with id '{school_id}' does not exist. Please try again.")

        # --- THIS IS THE FIX ---
        # 2. Temporarily wrap the user manager's create_superuser method.
        #    This allows us to inject the 'school' into the keyword arguments
        #    before the user is actually created.

        original_create_superuser = self.UserModel._default_manager.create_superuser

        def create_superuser_wrapper(**kwargs):
            # Add the selected school to the arguments
            kwargs['school'] = school
            # Call the original method with the modified arguments
            return original_create_superuser(**kwargs)
        
        # 3. Monkey-patch the method on the manager
        self.UserModel._default_manager.create_superuser = create_superuser_wrapper
        
        try:
            # 4. Call the original handle() method. It will now use our
            #    wrapped version of create_superuser internally.
            super().handle(*args, **options)
        finally:
            # 5. Restore the original method after we're done.
            self.UserModel._default_manager.create_superuser = original_create_superuser