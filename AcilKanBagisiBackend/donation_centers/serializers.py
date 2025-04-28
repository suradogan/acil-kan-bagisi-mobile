from rest_framework import serializers
from .models import DonationCenter

class DonationCenterSerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(required=False, read_only=True)

    class Meta:
        model = DonationCenter
        fields = ['id', 'name', 'address', 'city', 'district', 'latitude', 'longitude', 'phone', 'working_hours', 'is_active', 'distance'] 