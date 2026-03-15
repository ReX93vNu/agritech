from django.db import models
from django.contrib.auth.models import User

class Farm(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Sensor(models.Model):
    class StatusChoices(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        INACTIVE = 'Inactive', 'Inactive'

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='sensors')
    
    status = models.CharField(
        max_length=10, 
        choices=StatusChoices.choices, 
        default=StatusChoices.ACTIVE
    )
    
    battery_lvl = models.IntegerField(default=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return f"Sensor {self.id} - {self.farm.name}"

class Reading(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    soil_moisture = models.FloatField()
    ph = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    leaf_wetness = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Save the reading first
        super().save(*args, **kwargs)

        # 2. Automated Alert Logic
        # Irrigation Check
        if self.soil_moisture < 30.0:
            Alert.objects.create(
                sensor=self.sensor,
                triggered_by=self,
                risk_level="High",
                alert_type="Irrigation",
                recommendation=f"Low moisture ({self.soil_moisture}%). Irrigation recommended."
            )

        # Fungal Disease Check (Warm + Very Humid)
        if self.humidity > 85.0 and self.temperature > 28.0:
            Alert.objects.create(
                sensor=self.sensor,
                triggered_by=self,
                risk_level="Medium",
                alert_type="Disease",
                recommendation="High humidity and temp detected. Fungal risk increased."
            )

class Alert(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='alerts')
    # Link to the specific reading that caused the alert
    triggered_by = models.ForeignKey(Reading, on_delete=models.CASCADE, null=True, blank=True)
    risk_level = models.CharField(max_length=20) # Low, Medium, High
    recommendation = models.TextField()
    alert_type = models.CharField(max_length=50) # Disease or Irrigation
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alert_type} Alert - {self.risk_level}"
