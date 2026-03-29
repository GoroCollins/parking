from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from authentication.models import CustomUser

# Register your models here.


class UserAdminForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = "__all__"

    def clean_groups(self):
        groups = self.cleaned_data.get("groups")
        if groups and groups.count() > 1:
            raise forms.ValidationError("A user can only belong to one group.")
        return groups

class UserAdmin(BaseUserAdmin):
    form = UserAdminForm

    list_display = (
        "username", "email", "is_staff", "is_active"
    )

    search_fields = (
        "username", "first_name", "last_name", "email"
    )

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'middle_name', 'last_name', 'email')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )

admin.site.register(CustomUser, UserAdmin)