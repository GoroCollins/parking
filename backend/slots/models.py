from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.conf import settings
User = settings.AUTH_USER_MODEL

# Create your models here.
class ParkingArea(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255)
    rate_per_hour = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))],)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="parkingareas")
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name="modified_parking_areas")
    
    def __str__(self):
        return f"Parking area {self.name}"
    
    class Meta:
        verbose_name_plural = "Parking Areas"
        
class ParkingSlot(models.Model):
    area = models.ForeignKey(ParkingArea, on_delete=models.PROTECT, related_name="slots")
    name = models.CharField(max_length=25)
    description = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="parkingslots")
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name="modified_parking_slots")
    
    def __str__(self):
        return f"Slot Area:{self.area.name}, Slot Name:{self.name}, Slot Available:{self.available}"
    
    class Meta:
        verbose_name_plural = "Parking Slots"

class ParkingSession(models.Model):
    slot = models.ForeignKey(ParkingSlot, on_delete=models.PROTECT, related_name="sessions")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    # optional: store computed duration
    duration = models.DurationField(null=True, blank=True)

    # optional: store computed amount
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return f"Session for {self.slot.name} started at {self.start_time}"

    def calculate_amount(self):
        if not self.end_time:
            return Decimal("0.00")

        duration = self.end_time - self.start_time
        hours = duration.total_seconds() / 3600
        rate_per_hour = self.slot.area.rate_per_hour  # Fix to reference the ParkingArea rate

        # round up (charge full hour even if partial)
        charged_hours = int(hours) + (1 if hours % 1 > 0 else 0)

        return rate_per_hour * Decimal(charged_hours)

    def save(self, *args, **kwargs):
        # Ensure amount is calculated before saving
        if self.end_time:
            self.amount = self.calculate_amount()

        # Optional: Set the duration of the session
        if self.end_time:
            self.duration = self.end_time - self.start_time

        super(ParkingSession, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Parking Sessions"
        
class Payment(models.Model):
    PAYMENT_TYPES = [
        ("CASH", "Cash"),
        ("MPESA", "MPESA"),
        ("CARD", "Credit/Debit Card"),
    ]
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, db_index=True)
    session = models.ForeignKey(ParkingSession, on_delete=models.PROTECT, related_name="payments", null=True)
    amount = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))],)
    transaction_reference = models.CharField(max_length=50, null=True, blank=True)
    transaction_date = models.DateTimeField(auto_now_add=True)
    receipted_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="cashiers")
    
    def __str__(self):
        return f"Payment For Slot:{self.session.slot.name} made at {self.transaction_date}"
    
    class Meta:
        verbose_name_plural = "Payments"
