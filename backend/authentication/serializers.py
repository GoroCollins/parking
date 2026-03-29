from authentication.models import CustomUser
from rest_framework import serializers
from django.contrib.auth.models import Group, Permission

class UserSerializer(serializers.ModelSerializer[CustomUser]):
    full_name = serializers.CharField(read_only=True)
    role = serializers.SerializerMethodField(read_only=True)
    role_id = serializers.SerializerMethodField(read_only=True)
    role_name = serializers.ChoiceField(
        choices=[],  # We'll populate it in `__init__`
        write_only=True,
        required=False
    )
    class Meta:
        model = CustomUser
        fields = ["id", "username", "first_name", "middle_name", "last_name", "full_name", "role", "role_id", "role_name",]
        
        read_only_fields = ["id", "full_name", "role", "role_id",]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically load group names as choices
        self.fields['role_name'].choices = [
            (group.name, group.name) for group in Group.objects.all()
        ]

    def get_role(self, obj):
        return obj.groups.first().name if obj.groups.exists() else None

    def get_role_id(self, obj):
        return obj.groups.first().id if obj.groups.exists() else None

    def validate_role_name(self, value):
        try:
            return Group.objects.get(name=value)
        except Group.DoesNotExist:
            raise serializers.ValidationError("Group does not exist.")

    def create(self, validated_data):
        raise serializers.ValidationError("Creation of users is not allowed.")

    def update(self, instance, validated_data):
        request = self.context.get("request")

        allowed_fields = {"role_name"}
        invalid_fields = set(validated_data.keys()) - allowed_fields
        if invalid_fields:
            raise serializers.ValidationError(
                f"Only  'role_name' can be updated. Invalid fields: {', '.join(invalid_fields)}"
            )

        group_name = validated_data.pop("role_name", None)
        if group_name:
            group = Group.objects.get(name=group_name)
            instance.groups.clear()
            instance.groups.add(group)

            instance.is_superuser = group.name == "ADMIN"
            instance.is_staff = group.name == "ADMIN"

        if request and request.user.is_authenticated:
            validated_data["modified_by"] = request.user

        return super().update(instance, validated_data)