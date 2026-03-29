from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
User = get_user_model()

class Command(BaseCommand):
    help = "Assign the 'ADMIN' group to the superuser."

    def handle(self, *args, **options):
        superuser = User.objects.get(username='admin')
        admin_group, _ = Group.objects.get_or_create(name='ADMIN')
        superuser.groups.set([admin_group])
        superuser.save()
        self.stdout.write(self.style.SUCCESS(f"Superuser {superuser.username} assigned to the 'ADMIN' group"))