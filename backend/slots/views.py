from rest_framework import viewsets, permissions
from slots.serializers import ParkingAreaSerializer, ParkingSlotSerializer, PaymentSerializer, ParkingSessionSerializer, PaymentDetailsSerializer
from slots.models import ParkingArea, ParkingSlot, Payment, ParkingSession
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.pagination import LimitOffsetPagination
from django.db.models import Sum

# Create your views here.
class Pagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100

class ParkingAreaViewSet(viewsets.ModelViewSet):
    queryset = ParkingArea.objects.select_related("created_by", "modified_by")
    serializer_class = ParkingAreaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
class ParkingSlotViewSet(viewsets.ModelViewSet):
    queryset = ParkingSlot.objects.select_related("area", "created_by", "modified_by")
    serializer_class = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    @action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        slot = self.get_object()
        slot.available = True
        slot.save(update_fields=["available"])

        return Response({"detail": "Slot released successfully"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["post"])
    def checkout(self, request, pk=None):
        slot = self.get_object()

        session = slot.sessions.filter(end_time__isnull=True).first()

        if not session:
            return Response({"detail": "No active session"}, status=400)

        # End session
        session.end_time = timezone.now()
        session.duration = session.end_time - session.start_time
        session.amount = session.calculate_amount()
        session.save()

        # Free slot
        # slot.available = True
        # slot.save(update_fields=["available"])

        return Response({"slot": slot.name, "duration": session.duration, "amount": session.amount})
    
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        slot = self.get_object()

        if not slot.available:
            return Response({"detail": "Slot is already occupied"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new parking session using the serializer
        serializer = ParkingSessionSerializer(data={"slot": slot.id}, context={"request": request})
        if serializer.is_valid():
            session = serializer.save(start_time=timezone.now())  # set start_time now
            # Mark the slot as occupied
            slot.available = False
            slot.save(update_fields=["available"])
            return Response({
                "slot": slot.name,
                "availability": slot.available,
                "session": ParkingSessionSerializer(session).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=["get"])
    def count(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        return Response({"count": queryset.count()})
    
    @action(detail=False, methods=["get"])
    def occupied_slots(self, request):
        count = self.filter_queryset(self.get_queryset()).filter(available=False).count()
        return Response({"occupied_slots": count})
    
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("slot", "receipted_by")
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["payment_type", "slot"]
    filter_backends = [OrderingFilter]
    ordering_fields = ["transaction_date", "amount"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Deleting payments is not allowed"}, status=status.HTTP_403_FORBIDDEN)
    
    def update(self, request, *args, **kwargs):
        return Response({"detail": "Modifying payments is not allowed"}, status=status.HTTP_403_FORBIDDEN)
    
class PaymentDetailsViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("session__created_by", "session__slot__area", "receipted_by")
    serializer_class = PaymentDetailsSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter,]
    pagination_class = Pagination
    ordering_fields = ["transaction_date", "id", "amount"]
    ordering = ["-transaction_date"]
    search_fields = ["id", "session", "receipted_by__username",]
    
class ParkingSessionViewSet(viewsets.ModelViewSet):
    queryset = ParkingSession.objects.filter(end_time__isnull=True).select_related("slot", "created_by")
    serializer_class = ParkingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter,]
    filterset_fields = ["slot", "created_by"]
    ordering_fields = ["start_time", "end_time", "duration", "amount"]
    search_fields = ["id", "slot__name", "created_by__username"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    @action(detail=False, methods=["get"])
    def count(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        return Response({"count": queryset.count()})
    
    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Deleting sessions is not allowed"}, status=status.HTTP_403_FORBIDDEN)
    
    def update(self, request, *args, **kwargs):
        return Response({"detail": "Modifying sessions is not allowed"}, status=status.HTTP_403_FORBIDDEN)
    
class TotalRevenueViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="total-purchases")
    def total_revenue(self, request):
        total = Payment.objects.aggregate(total_amount=Sum('amount'))['total_amount'] or 0
        return Response({"total_revenue": total}, status=status.HTTP_200_OK)