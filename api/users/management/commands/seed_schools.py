from django.core.management.base import BaseCommand
from users.models import School
from decouple import config

class Command(BaseCommand):
    help = 'Seed initial schools if SEED_SCHOOLS env var is set.'

    def handle(self, *args, **options):
        if config('SEED_SCHOOLS', default=False, cast=bool) == True:
            School.objects.update_or_create(code='moonlight', defaults={'name': 'Moonlight Academy'})
            School.objects.update_or_create(code='nejashi', defaults={'name': 'Nejashi Academy'})
            self.stdout.write(self.style.SUCCESS('Seeded Moonlight Academy and Nejashi Academy.'))
        else:
            self.stdout.write('SEED_SCHOOLS env var not set to true; skipping school seeding.') 