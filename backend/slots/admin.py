from django.contrib import admin
from slots.models import ParkingArea, ParkingSession, ParkingSlot, Payment

# Register your models here.
admin.site.register(ParkingArea)
admin.site.register(ParkingSlot)

@admin.register(ParkingSession)
class ParkingSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "slot", "amount", "duration", )
    readonly_fields = [field.name for field in ParkingSession._meta.fields]

    def has_add_permission(self, request):
        return True

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
    
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "payment_type", "amount", "receipted_by", "transaction_date", )
    readonly_fields = [field.name for field in Payment._meta.fields]

    def has_add_permission(self, request):
        return True

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
