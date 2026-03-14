from rest_framework import viewsets, filters
from .models import Farm, Sensor, Reading, Alert
from .serializers import FarmSerializer, SensorSerializer, ReadingSerializer, AlertSerializer

class ReadingViewSet(viewsets.ModelViewSet):
    queryset = Reading.objects.all().order_by('-timestamp')
    serializer_class = ReadingSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['sensor__id', 'timestamp'] # Allows searching by sensor ID or date string

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-timestamp')
    serializer_class = AlertSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
