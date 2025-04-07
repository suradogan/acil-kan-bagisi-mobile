from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import pymongo
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = CustomUser(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        
        # MongoDB'ye de kaydet
        try:
            # MongoDB bağlantısı
            client = pymongo.MongoClient(settings.MONGODB_URI)
            db = client[settings.MONGODB_DB_NAME]
            users_collection = db["users"]
            
            # Kullanıcı verilerini hazırla
            user_data = {
                "email": email,
                "full_name": extra_fields.get('full_name', ''),
                "blood_type": extra_fields.get('blood_type', ''),
                "phone_number": extra_fields.get('phone_number', ''),
                "city": extra_fields.get('city', ''),
                "district": extra_fields.get('district', ''),
                "address": extra_fields.get('address', ''),
                "is_active": True
            }
            
            # MongoDB'ye kaydet
            result = users_collection.insert_one(user_data)
            print(f"MongoDB'ye kullanıcı kaydedildi: {result.inserted_id}")
        except Exception as e:
            print(f"MongoDB kayıt hatası: {e}")
            
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

# Django ORM Model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    # Kan grubu seçenekleri tanımla
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A Positive'), ('A-', 'A Negative'),
        ('B+', 'B Positive'), ('B-', 'B Negative'),
        ('AB+', 'AB Positive'), ('AB-', 'AB Negative'),
        ('O+', 'O Positive'), ('O-', 'O Negative')
    ]
    
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    donation_count = models.IntegerField(default=0)
    last_donation_date = models.DateField(null=True, blank=True)
    is_donor = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'blood_type']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
