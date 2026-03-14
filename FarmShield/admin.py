from django.contrib import admin
from .models import Farm, Sensor, Reading, Alert

admin.site.register(Farm)
admin.site.register(Sensor)
admin.site.register(Reading)
admin.site.register(Alert)