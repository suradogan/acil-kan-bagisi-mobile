from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Notification, NotificationType


class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    notification_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'notification_id', 'user', 'title', 'message', 
            'notification_type', 'notification_type_display',
            'is_read', 'created_at', 'target_url'
        ]
    
    def get_notification_type_display(self, obj):
        try:
            return NotificationType(obj.notification_type).label
        except:
            return "Bilinmeyen Bildirim Türü"


class MongoNotificationSerializer(serializers.Serializer):
    """
    MongoDB'den alınan bildirimler için custom serializer
    """
    _id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    notification_type = serializers.CharField(read_only=True)
    notification_type_display = serializers.SerializerMethodField()
    is_read = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    target_url = serializers.CharField(read_only=True, allow_null=True)
    
    def get_notification_type_display(self, obj):
        try:
            notification_type = obj.get('notification_type', 'system')
            return NotificationType(notification_type).label
        except:
            return "Bilinmeyen Bildirim Türü"


class NotificationCreateSerializer(serializers.Serializer):
    """
    Yeni bildirim oluşturmak için serializer
    """
    user_id = serializers.IntegerField()
    title = serializers.CharField(max_length=100)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=NotificationType.choices, default=NotificationType.SYSTEM)
    target_url = serializers.CharField(max_length=255, allow_null=True, required=False)
    
    def create(self, validated_data):
        from users.models import CustomUser
        
        user = CustomUser.objects.get(id=validated_data['user_id'])
        notification = Notification(
            user=user,
            title=validated_data['title'],
            message=validated_data['message'],
            notification_type=validated_data['notification_type'],
            target_url=validated_data.get('target_url')
        )
        notification_id = notification.save()
        return {'notification_id': notification_id} 