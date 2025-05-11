from django.db.models.signals import post_save
from django.dispatch import receiver
from donations.models import EmergencyRequest, Donation
from .models import Notification, NotificationType
import datetime


@receiver(post_save, sender=EmergencyRequest)
def create_emergency_notification(sender, instance, created, **kwargs):
    """
    Acil kan ihtiyacı oluşturulduğunda, uygun bağışçılara bildirim gönderir
    """
    if created:
        from users.models import CustomUser
        
        # Aynı kan grubuna sahip ve kan bağışı yapabilen kullanıcıları bul
        # Kan grubu uyumluluğunu da dikkate al
        compatible_blood_types = get_compatible_donors(instance.blood_type)
        
        # Son 3 ay içinde bağış yapmamış kullanıcılar
        three_months_ago = datetime.datetime.now() - datetime.timedelta(days=90)
        
        potential_donors = CustomUser.objects.filter(
            blood_type__in=compatible_blood_types,
            is_donor=True,
            is_active=True
        ).exclude(last_donation_date__gte=three_months_ago.date())
        
        # Konum yakınlığına göre filtreleme yapabilirdik,
        # ancak bu karmaşıklığı artırır
        
        # Her potansiyel bağışçıya bildirim gönder
        for donor in potential_donors:
            Notification(
                user=donor,
                title="Acil Kan İhtiyacı",
                message=f"{instance.patient_name} isimli hasta için {instance.blood_type} kan grubuna ihtiyaç var. Hastane: {instance.hospital}, {instance.city}",
                notification_type=NotificationType.EMERGENCY,
                target_url=f"/emergency/{instance.id}/"
            ).save()


@receiver(post_save, sender=Donation)
def create_donation_notification(sender, instance, created, **kwargs):
    """
    Bağış tamamlandığında, bağışçıya teşekkür bildirimi gönderir
    """
    if created and instance.status == 'completed':
        # Teşekkür bildirimi
        Notification(
            user=instance.user,
            title="Bağışınız İçin Teşekkürler",
            message="Kan bağışınız başarıyla kaydedildi. Hayat kurtardığınız için teşekkür ederiz!",
            notification_type=NotificationType.DONATION_THANKYOU,
            target_url="/donations/history/"
        ).save()
        
        # Bağışçının bir sonraki bağış zamanını hesapla (3 ay sonra)
        next_donation_date = instance.date + datetime.timedelta(days=90)
        
        # Gelecekteki hatırlatma bildirimi için veri tabanında kayıt oluşturabilirdik,
        # ancak bunun için ayrı bir bildirim zamanlama sistemi gerekir


def get_compatible_donors(recipient_blood_type):
    """
    Alıcı için uyumlu kan gruplarını döndürür
    """
    compatibility = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    }
    
    return compatibility.get(recipient_blood_type, []) 