from rest_framework.routers import DefaultRouter
from django.urls import path
from slots.views import ParkingAreaViewSet, ParkingSlotViewSet, PaymentViewSet, PaymentDetailsViewSet, ParkingSessionViewSet, TotalRevenueViewSet
router = DefaultRouter()

router.register("parkingareas", ParkingAreaViewSet, basename="parkingarea")
router.register("parkingslots", ParkingSlotViewSet, basename="parkingslot")
router.register("payments", PaymentViewSet, basename="payment")
router.register("parkingsessions", ParkingSessionViewSet, basename="parkingsession")
router.register("payment-details", PaymentDetailsViewSet, basename="payment-details")

app_name = "slots"

urlpatterns = router.urls

urlpatterns +=[
    path('total-revenue/', TotalRevenueViewSet.as_view({'get': 'total_revenue'}), name='total-revenue'),
]