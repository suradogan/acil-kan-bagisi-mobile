from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import CustomUser
import pymongo
from django.conf import settings
import datetime


class NotificationType(models.TextChoices):
    EMERGENCY = 'emergency', _('Acil Kan İhtiyacı')
    DONATION_REMINDER = 'donation_reminder', _('Bağış Hatırlatması')
    DONATION_THANKYOU = 'donation_thankyou', _('Bağış Teşekkürü')
    APPOINTMENT_REMINDER = 'appointment_reminder', _('Randevu Hatırlatması')
    SYSTEM = 'system', _('Sistem Bildirimi')
    OTHER = 'other', _('Diğer')


class Notification(models.Model):
    """
    Django modelidir, ancak MongoDB'ye kaydedilir.
    notification_id MongoDB'deki belge ID'sidir.
    """
    notification_id = models.CharField(max_length=255, primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    target_url = models.CharField(max_length=255, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # MongoDB bağlantısı
        client = pymongo.MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB_NAME]
        notifications_collection = db[settings.NOTIFICATION_SETTINGS['NOTIFICATION_COLLECTION']]
        
        notification_data = {
            'user_id': str(self.user.id),
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'created_at': datetime.datetime.now(),
            'target_url': self.target_url
        }
        
        # Yeni bildirim ise ekle, varsa güncelle
        if not self.notification_id:
            result = notifications_collection.insert_one(notification_data)
            self.notification_id = str(result.inserted_id)
        else:
            notifications_collection.update_one(
                {'_id': pymongo.ObjectId(self.notification_id)},
                {'$set': notification_data}
            )
        
        # Django modelini kaydetme, MongoDB'de zaten saklanıyor
        return self.notification_id
    
    @classmethod
    def get_user_notifications(cls, user_id, limit=20, offset=0, unread_only=False):
        # MongoDB bağlantısı
        client = pymongo.MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB_NAME]
        notifications_collection = db[settings.NOTIFICATION_SETTINGS['NOTIFICATION_COLLECTION']]
        
        # Filtre oluştur
        filter_query = {'user_id': str(user_id)}
        if unread_only:
            filter_query['is_read'] = False
        
        # Bildirimler al
        cursor = notifications_collection.find(filter_query).sort('created_at', pymongo.DESCENDING).skip(offset).limit(limit)
        
        return list(cursor)
    
    @classmethod
    def mark_as_read(cls, notification_id):
        # MongoDB bağlantısı
        client = pymongo.MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB_NAME]
        notifications_collection = db[settings.NOTIFICATION_SETTINGS['NOTIFICATION_COLLECTION']]
        
        notifications_collection.update_one(
            {'_id': pymongo.ObjectId(notification_id)},
            {'$set': {'is_read': True}}
        )
        
    def __str__(self):
        return f"{self.title} - {self.user.email}" 