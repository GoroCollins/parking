from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# Create your models here.
class CustomUser(AbstractUser):
    first_name = models.CharField(_("First Name"), blank=True, max_length=255)
    middle_name = models.CharField(_("Middle Name"), blank=True, max_length=255)
    last_name = models.CharField(_("Last Name"), blank=True, max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        return " ".join(filter(None, [self.first_name, self.middle_name, self.last_name]))
    
    @property
    def role(self):
        """Return the user's first group name, if any."""
        return self.groups.first().name if self.groups.exists() else None
    
    class Meta:
        verbose_name_plural = "Users"