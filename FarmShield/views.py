from rest_framework import viewsets, permissions
from .models import Farm, Sensor, Reading, Alert
from .serializers import FarmSerializer, SensorSerializer, ReadingSerializer, AlertSerializer
from django.db.models import Q

class ReadingViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Reading.objects.filter(sensor__farm__owner=user)
        
        search = self.request.query_params.get('search', None)
        
        if search:
            search_lower = search.lower()
            
            if search_lower == 'abnormal': # for record statuses
                queryset = queryset.filter(alert__isnull=False).distinct()
            elif search_lower == 'normal':
                queryset = queryset.filter(alert__isnull=True)
            elif search.isdigit():
                queryset = queryset.filter( #searches by id
                    Q(id=search) | 
                    Q(sensor__id=search)
                )
            else: # fuzzy search for farm names
                queryset = queryset.filter(sensor__farm__name__icontains=search)
                
        return queryset.order_by('-timestamp')

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
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user) # sets user to the logged in user when making new records in front end
