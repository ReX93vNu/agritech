from django.db import models
from django.contrib.auth.models import User

class Farm(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Sensor(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='sensors')
    status = models.CharField(max_length=20, default="Active")
    battery_lvl = models.IntegerField(default=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

class Reading(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    soil_moisture = models.FloatField()
    ph = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    leaf_wetness = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Alert(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='alerts')
    risk_level = models.CharField(max_length=20) # Low, Medium, High
    recommendation = models.TextField()
    alert_type = models.CharField(max_length=50) # Disease or Irrigation
    timestamp = models.DateTimeField(auto_now_add=True)
