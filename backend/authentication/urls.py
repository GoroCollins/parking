from django.urls import path
from rest_framework.routers import DefaultRouter
from authentication.views import UserViewSet, LogoutView

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")


app_name = "users"


urlpatterns = router.urls

urlpatterns += [
    path('logout/', LogoutView.as_view(), name='logout'),
]
