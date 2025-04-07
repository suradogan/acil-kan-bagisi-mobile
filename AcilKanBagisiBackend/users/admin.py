from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser

@admin.register(CustomUser)
class UserAdmin(BaseUserAdmin):
    """Admin panel for CustomUser model."""
    
    list_display = ('email', 'full_name', 'blood_type', 'last_donation_date', 'donation_count', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'blood_type', 'city')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('full_name', 'blood_type', 'phone_number', 'address', 'city', 'district')}),
        (_('Donation info'), {'fields': ('last_donation_date', 'donation_count')}),
        (_('Location'), {'fields': ('latitude', 'longitude')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_donor', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'blood_type', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'full_name', 'phone_number', 'city')
    ordering = ('email',)
