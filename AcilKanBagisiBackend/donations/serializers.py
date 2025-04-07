from rest_framework import serializers
from .models import Donation, DonationCenter, EmergencyRequest, EmergencyResponse
from users.serializers import UserSerializer

class DonationCenterSerializer(serializers.ModelSerializer):
    """Serializer for DonationCenter model."""

    class Meta:
        model = DonationCenter
        fields = '__all__'

class DonationSerializer(serializers.ModelSerializer):
    """Serializer for Donation model."""

    donation_center_detail = DonationCenterSerializer(source='donation_center', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        """Create a donation and update user's donation count and last donation date."""
        request = self.context.get("request")
        user = request.user
        
        # Create donation
        donation = Donation.objects.create(user=user, **validated_data)
        
        # Update user's donation count and last donation date
        user.donation_count += 1
        if not user.last_donation_date or donation.date > user.last_donation_date:
            user.last_donation_date = donation.date
        user.save()
        
        return donation

class EmergencyRequestSerializer(serializers.ModelSerializer):
    """Serializer for EmergencyRequest model."""

    requester_detail = UserSerializer(source='requester', read_only=True)
    
    class Meta:
        model = EmergencyRequest
        fields = '__all__'
        read_only_fields = ('requester', 'status', 'units_received', 'created_at', 'updated_at')

    def create(self, validated_data):
        """Create an emergency request with the requester as the current user."""
        request = self.context.get("request")
        validated_data['requester'] = request.user
        return super().create(validated_data)

class EmergencyResponseSerializer(serializers.ModelSerializer):
    """Serializer for EmergencyResponse model."""

    donor_detail = UserSerializer(source='donor', read_only=True)
    emergency_request_detail = EmergencyRequestSerializer(source='emergency_request', read_only=True)
    
    class Meta:
        model = EmergencyResponse
        fields = '__all__'
        read_only_fields = ('donor', 'created_at', 'updated_at')

    def create(self, validated_data):
        """Create an emergency response with the donor as the current user."""
        request = self.context.get("request")
        validated_data['donor'] = request.user
        
        # Check if user already responded to this emergency request
        emergency_request = validated_data.get('emergency_request')
        if EmergencyResponse.objects.filter(donor=request.user, emergency_request=emergency_request).exists():
            raise serializers.ValidationError("You have already responded to this emergency request.")
            
        return super().create(validated_data)
