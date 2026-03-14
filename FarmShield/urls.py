from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, SensorViewSet, ReadingViewSet, AlertViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'readings', ReadingViewSet)
router.register(r'alerts', AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]