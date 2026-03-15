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
    serializer_class = SensorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Sensor.objects.filter(farm__owner=user)
        
        search = self.request.query_params.get('search', None)
        
        if search:
            s = search.lower()
            
            # FIX 1: Exact status matching to prevent 'active' showing 'inactive'
            if s in ['active', 'inactive']:
                # Capitalize to match the "Active"/"Inactive" string in your model
                queryset = queryset.filter(status=s.capitalize())
            elif search.isdigit():
                queryset = queryset.filter(id=search)
            else:
                # FIX 2: Added farm name search for the node tab
                queryset = queryset.filter(
                    Q(farm__name__icontains=search)
                )
                
        return queryset.order_by('id')



class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Farm.objects.filter(owner=self.request.user)
        
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter( # fuzzy search for name/location
                Q(name__icontains=search) | 
                Q(location__icontains=search)
            )
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user) # sets user to the logged in user when making new records in front end
        
        
        

