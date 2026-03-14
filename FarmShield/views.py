from rest_framework import viewsets, filters
from .models import Farm, Sensor, Reading, Alert
from .serializers import FarmSerializer, SensorSerializer, ReadingSerializer, AlertSerializer
from rest_framework import viewsets, permissions

class ReadingViewSet(viewsets.ModelViewSet):
    queryset = Reading.objects.all().order_by('-timestamp')
    serializer_class = ReadingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['sensor__id', 'timestamp'] # Allows searching by sensor ID or date string

    def get_queryset(self):
        # This is the "Magic" part:
        # We filter the readings based on the owner of the farm the sensor is on
        user = self.request.user
        return Reading.objects.filter(sensor__farm__owner=user).order_by('-timestamp')

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-timestamp')
    serializer_class = AlertSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

    def get_queryset(self):
        return Sensor.objects.filter(farm__owner=self.request.user)

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer

    def get_queryset(self):
        return Farm.objects.filter(owner=self.request.user)
