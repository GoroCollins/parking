from django.contrib import admin
from slots.models import ParkingArea, ParkingSession, ParkingSlot, Payment

# Register your models here.
admin.site.register(ParkingArea)
admin.site.register(ParkingSlot)
admin.site.register(ParkingSession) # make read only
admin.site.register(Payment) # make read only
