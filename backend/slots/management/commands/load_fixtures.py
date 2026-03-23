import json
from datetime import datetime, UTC
from django.core.management.base import BaseCommand
from django.apps import apps
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Load initial data from a fixture JSON file with safe insertion"

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to the fixture file', default='/app/seeder.json')

    def handle(self, *args, **options):
        file_path = options['file']

        try:
            with open(file_path, "r") as file:
                data = json.load(file)

            for entry in data:
                model_name = entry.get("model")
                fields = entry.get("fields", {})

                if not model_name or not fields:
                    self.stdout.write(self.style.ERROR("Skipping entry with missing model or fields"))
                    continue

                try:
                    Model = apps.get_model(model_name)
                    model_fields = {f.name for f in Model._meta.get_fields()}

                    now = datetime.now(UTC).isoformat() + "Z"

                    # Only set these if the model has them
                    for field in ["created_at", "updated_at", "modified_at", "registration_date"]:
                        if field in model_fields:
                            fields.setdefault(field, now)

                    if "pk" in entry:
                        obj, created = Model.objects.get_or_create(pk=entry["pk"], defaults=fields)
                    else:
                        self.stderr.write(self.style.ERROR("Missing pk field. Skipping entry."))
                        continue
                    # if "created_by" in fields:
                    #     try:
                    #         fields["created_by"] = User.objects.get(pk=fields["created_by"])
                    #     except User.DoesNotExist:
                    #         self.stderr.write(self.style.ERROR(f"User {fields['created_by']} does not exist. Skipping {model_name}."))
                    #         continue

                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Created {model_name}: {obj}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"Already exists: {model_name} ({obj})"))

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing {model_name}: {e}"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error loading {file_path}: {e}"))