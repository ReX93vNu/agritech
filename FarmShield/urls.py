from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, SensorViewSet, ReadingViewSet, AlertViewSet

router = DefaultRouter()
router.register(r'readings', ReadingViewSet, basename='reading') 
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'sensors', SensorViewSet, basename='sensor')
router.register(r'alerts', AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]