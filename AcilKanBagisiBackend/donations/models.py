from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import CustomUser

class DonationCenter(models.Model):
    name = models.CharField(_('name'), max_length=100)
    address = models.CharField(_('address'), max_length=255)
    city = models.CharField(_('city'), max_length=100)
    district = models.CharField(_('district'), max_length=100)
    phone = models.CharField(_('phone'), max_length=20)
    email = models.EmailField(_('email'), blank=True, null=True)
    website = models.URLField(_('website'), blank=True, null=True)
    working_hours = models.CharField(_('working hours'), max_length=100, blank=True, null=True)
    latitude = models.FloatField(_('latitude'), blank=True, null=True)
    longitude = models.FloatField(_('longitude'), blank=True, null=True)
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('donation center')
        verbose_name_plural = _('donation centers')
        ordering = ['name', 'city']
    
    def __str__(self):
        return f"{self.name} - {self.city}"

class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('scheduled', _('Scheduled')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='donations', verbose_name=_('donor'))
    donation_center = models.ForeignKey(DonationCenter, on_delete=models.CASCADE, related_name='donations', verbose_name=_('donation center'))
    date = models.DateField(_('date'))
    quantity = models.IntegerField(_('quantity in ml'), default=450)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(_('note'), blank=True, null=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('donation')
        verbose_name_plural = _('donations')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.date}"

class EmergencyRequest(models.Model):
    URGENCY_CHOICES = [
        (1, _('Low')),
        (2, _('Medium')),
        (3, _('High')),
    ]
    
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('closed', _('Closed')),
        ('fulfilled', _('Fulfilled')),
        ('expired', _('Expired')),
    ]
    
    # Doğrudan BLOOD_TYPE_CHOICES tanımlayalım, CustomUser'dan almak yerine
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A Positive'), ('A-', 'A Negative'),
        ('B+', 'B Positive'), ('B-', 'B Negative'),
        ('AB+', 'AB Positive'), ('AB-', 'AB Negative'),
        ('O+', 'O Positive'), ('O-', 'O Negative')
    ]
    
    requester = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='emergency_requests', verbose_name=_('requester'))
    patient_name = models.CharField(_('patient name'), max_length=100)
    blood_type = models.CharField(_('blood type'), max_length=3, choices=BLOOD_TYPE_CHOICES)
    hospital = models.CharField(_('hospital'), max_length=100)
    city = models.CharField(_('city'), max_length=100)
    district = models.CharField(_('district'), max_length=100, blank=True, null=True)
    address = models.CharField(_('address'), max_length=255, blank=True, null=True)
    units_needed = models.IntegerField(_('units needed'), default=1)
    units_received = models.IntegerField(_('units received'), default=0)
    urgency_level = models.IntegerField(_('urgency level'), choices=URGENCY_CHOICES, default=2)
    phone_number = models.CharField(_('phone number'), max_length=20)
    additional_info = models.TextField(_('additional information'), blank=True, null=True)
    expires_at = models.DateTimeField(_('expires at'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('emergency request')
        verbose_name_plural = _('emergency requests')
        ordering = ['-urgency_level', '-created_at']
    
    def __str__(self):
        return f"{self.patient_name} - {self.blood_type} - {self.hospital}"

class EmergencyResponse(models.Model):
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    donor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='emergency_responses', verbose_name=_('donor'))
    emergency_request = models.ForeignKey(EmergencyRequest, on_delete=models.CASCADE, related_name='responses', verbose_name=_('emergency request'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    response_time = models.DateTimeField(_('response time'), auto_now_add=True)
    donation_time = models.DateTimeField(_('donation time'), blank=True, null=True)
    note = models.TextField(_('note'), blank=True, null=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('emergency response')
        verbose_name_plural = _('emergency responses')
        ordering = ['-response_time']
    
    def __str__(self):
        return f"{self.donor.full_name} - {self.emergency_request.patient_name}"
