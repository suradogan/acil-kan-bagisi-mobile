from django.contrib import admin
from .models import DonationCenter, Donation, EmergencyRequest, EmergencyResponse

@admin.register(DonationCenter)
class DonationCenterAdmin(admin.ModelAdmin):
    """Admin panel for DonationCenter model."""
    
    list_display = ('name', 'city', 'district', 'phone', 'is_active')
    list_filter = ('is_active', 'city', 'district')
    search_fields = ('name', 'city', 'district', 'address', 'phone')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    """Admin panel for Donation model."""
    
    list_display = ('user', 'donation_center', 'date', 'status')
    list_filter = ('status', 'date', 'donation_center')
    search_fields = ('user__email', 'user__full_name', 'donation_center__name')
    raw_id_fields = ('user', 'donation_center')

@admin.register(EmergencyRequest)
class EmergencyRequestAdmin(admin.ModelAdmin):
    """Admin panel for EmergencyRequest model."""
    
    list_display = ('patient_name', 'blood_type', 'hospital', 'city', 'urgency_level', 'status', 'created_at')
    list_filter = ('status', 'blood_type', 'urgency_level', 'city')
    search_fields = ('patient_name', 'hospital', 'city', 'requester__email', 'requester__full_name')
    raw_id_fields = ('requester',)

@admin.register(EmergencyResponse)
class EmergencyResponseAdmin(admin.ModelAdmin):
    """Admin panel for EmergencyResponse model."""
    
    list_display = ('donor', 'emergency_request', 'status', 'response_time')
    list_filter = ('status', 'response_time')
    search_fields = ('donor__email', 'donor__full_name', 'emergency_request__patient_name')
    raw_id_fields = ('donor', 'emergency_request')
