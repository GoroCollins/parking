from slots.models import ParkingArea, ParkingSlot, Payment, ParkingSession
from authentication.models import CustomUser
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

class ParkingAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingArea
        fields = [
            "id", "name", "description", "rate_per_hour", "created_by", "created_at", "modified_by", "modified_at"
        ]
        read_only_fields = [
            "id", "created_by", "created_at", "modified_by", "modified_at"
        ]
        
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['modified_by'] = request.user
        return super().update(instance, validated_data)
    
class ParkingSlotSerializer(serializers.ModelSerializer):
    current_session = serializers.SerializerMethodField()
    parking_area = serializers.CharField(source="area.name", read_only=True)
    class Meta:
        model = ParkingSlot
        fields = [
            "id", "area", "name", "description", "available", "created_by", "created_at", "modified_by", "modified_at", 
            "current_session", "parking_area"
        ]
        read_only_fields = [
            "id", "created_by", "created_at", "modified_by", "modified_at", "parking_area", "current_session"
        ]
        
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['modified_by'] = request.user
        return super().update(instance, validated_data)
    
    def get_current_session(self, obj):
        # Get the latest session (active or last ended)
        session = obj.sessions.order_by("-start_time").first()
        if not session:
            return None
        return {
            "id": session.id,
            "end_time": session.end_time,
            "paid": session.payments.exists(),
            "amount": session.amount or 0,
        }

class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "full_name"]

class ParkingSlotMinimalSerializer(serializers.ModelSerializer):
    parking_area = serializers.CharField(source="area.name", read_only=True)
    class Meta:
        model = ParkingSlot
        fields = ["name", "parking_area"]

class ParkingSessionSerializer(serializers.ModelSerializer):
    assigned_by = UserMinimalSerializer(source="created_by", read_only=True)
    slot_name = ParkingSlotMinimalSerializer(source="slot", read_only=True)
    duration_display = serializers.SerializerMethodField()
    class Meta:
        model = ParkingSession
        fields = [
            "id", "slot", "start_time", "end_time", "duration", "created_by", "amount", "assigned_by", "slot_name", "duration_display"
        ]
        read_only_fields = [
            "id", "start_time", "end_time", "duration", "created_by", "amount", "assigned_by", "slot_name", "duration_display"
        ]
        
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
    
    def get_duration_display(self, obj):
        if not obj.duration:
            return None

        total_seconds = int(obj.duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        return f"{hours}h {minutes}m"
    
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "payment_type", "session", "amount", "transaction_reference", "transaction_date", "receipted_by"
        ]
        read_only_fields = [
            "id", "transaction_date", "receipted_by"
        ]
        
    def validate(self, attrs):
        payment_type = attrs.get("payment_type")
        transaction_reference = attrs.get("transaction_reference")
        session = attrs.get("session")

        if payment_type != "CASH" and not transaction_reference:
            raise serializers.ValidationError({
                "transaction_reference": "Required for non-cash payments"
            })

        if session and session.slot.available:
            raise serializers.ValidationError({"slot": "This parking slot is already occupied"})

        return attrs
        
    def create(self, validated_data):
        request = self.context.get('request')

        with transaction.atomic():
            session = validated_data["session"]

            # if session.slot.available:
            #     raise serializers.ValidationError({"slot": "You cannot pay for an open slot/non-existent session"})
            
            if not session or not session.end_time:
                raise serializers.ValidationError({"session": "Session must be completed before payment"})

            # Mark slot unavailable
            session.slot.available = True
            session.slot.save(update_fields=["available"])

            # Attach session (you'll need to add FK in Payment)
            validated_data["receipted_by"] = request.user

            payment = super().create(validated_data)

        return payment
    
class PaymentDetailsSerializer(serializers.ModelSerializer):
    payment_type_name = serializers.CharField(source="get_payment_type_display", read_only=True)
    cashier = UserMinimalSerializer(source="receipted_by", read_only=True)
    session = ParkingSessionSerializer(read_only=True)
    slot = ParkingSlotMinimalSerializer(source="session.slot", read_only=True)
    class Meta:
        model = Payment
        fields = [
            "id", "payment_type", "transaction_date", "receipted_by", "session", 
            "transaction_reference",  "amount", "payment_type_name", "cashier", "slot"
        ]
        read_only_fields = fields