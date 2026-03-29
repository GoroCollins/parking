from django.urls import path
from rest_framework.routers import DefaultRouter
from authentication.views import UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")


app_name = "users"


urlpatterns = router.urls
