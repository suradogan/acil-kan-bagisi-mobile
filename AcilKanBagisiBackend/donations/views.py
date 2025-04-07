from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Donation, DonationCenter, EmergencyRequest, EmergencyResponse
from .serializers import (
    DonationSerializer, 
    DonationCenterSerializer, 
    EmergencyRequestSerializer,
    EmergencyResponseSerializer
)

class DonationListCreateView(generics.ListCreateAPIView):
    """API view to create a new donation or list all donations."""
    
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only donations for the current user."""
        return Donation.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API view to retrieve, update or delete a donation."""
    
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only donations for the current user."""
        return Donation.objects.filter(user=self.request.user)

class DonationCenterListView(generics.ListAPIView):
    """API view to list all donation centers."""
    
    queryset = DonationCenter.objects.filter(is_active=True)
    serializer_class = DonationCenterSerializer
    permission_classes = [IsAuthenticated]

class EmergencyRequestListCreateView(generics.ListCreateAPIView):
    """API view to create a new emergency request or list active emergency requests."""
    
    serializer_class = EmergencyRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return active emergency requests."""
        return EmergencyRequest.objects.filter(status='active')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class EmergencyRequestDetailView(generics.RetrieveUpdateAPIView):
    """API view to retrieve or update an emergency request."""
    
    serializer_class = EmergencyRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only emergency requests created by the current user."""
        return EmergencyRequest.objects.filter(requester=self.request.user)
