from rest_framework import serializers
from .models import Farm, Sensor, Reading, Alert

class ReadingSerializer(serializers.ModelSerializer):
    # These extra fields help the React frontend
    farm_name = serializers.CharField(source='sensor.farm.name', read_only=True)
    owner_name = serializers.CharField(source='sensor.farm.owner.username', read_only=True)
    is_abnormal = serializers.SerializerMethodField()
    advice = serializers.SerializerMethodField()

    class Meta:
        model = Reading
        fields = '__all__'

    def get_is_abnormal(self, obj):
        # Checks if this reading triggered any alerts
        return obj.alert_set.exists()

    def get_advice(self, obj):
        # If abnormal, return the recommendation from the alert
        alert = obj.alert_set.first()
        if alert:
            return alert.recommendation
        return "Everything is normal. No action needed."

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = '__all__'

