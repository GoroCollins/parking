from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = "Assign permissions to system roles: USER, TECHNICIAN, HELPDESK_ADMIN, ADMIN"

    def handle(self, *args, **options):
        roles_permissions = {
            "OPERATOR": [
                # From slots app
                ("slots", "parkingarea", ["add_parkingarea", "view_parkingarea", "change_parkingarea"]),
                ("slots", "parkingslot", ["add_parkingslot", "view_parkingslot", "change_parkingslot"]),
                ("slots", "parkingsession", ["add_parkingsession", "view_parkingsession", "change_parkingsession"]),
                ("slots", "payment", ["add_payment", "view_payment", "change_payment"]),
                # From authentication app
                ("authentication", "customuser", ["view_user"]),
            ],
            "ADMIN": "ALL",  # Full permissions
        }

        for group_name, perms in roles_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)

            if perms == "ALL":
                group.permissions.set(Permission.objects.all())
                self.stdout.write(self.style.SUCCESS(f"{group_name}: All permissions assigned."))
                continue

            for app_label, model, codenames in perms:
                try:
                    content_type = ContentType.objects.get(app_label=app_label, model=model)
                    for codename in codenames:
                        try:
                            perm = Permission.objects.get(codename=codename, content_type=content_type)
                            group.permissions.add(perm)
                        except Permission.DoesNotExist:
                            self.stdout.write(
                                self.style.WARNING(f"Permission '{codename}' not found for model '{model}' in app '{app_label}'")
                            )
                except ContentType.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f"Model '{model}' not found in app '{app_label}'")
                    )

            self.stdout.write(self.style.SUCCESS(f"{group_name}: Permissions assigned."))

        self.stdout.write(self.style.SUCCESS("✅ All roles and permissions processed."))