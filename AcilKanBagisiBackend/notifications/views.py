from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
import requests
import json
from django.conf import settings
import pymongo


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    """
    Kullanıcının bildirimlerini döndürür
    """
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 20))
    unread_only = request.query_params.get('unread_only', '').lower() == 'true'
    
    offset = (page - 1) * limit
    
    # MongoDB'den bildirimler al
    notifications = Notification.get_user_notifications(
        user_id=request.user.id,
        limit=limit,
        offset=offset,
        unread_only=unread_only
    )
    
    # Toplam bildirim sayısını bul (sayfalama için)
    client = pymongo.MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    notifications_collection = db[settings.NOTIFICATION_SETTINGS['NOTIFICATION_COLLECTION']]
    
    filter_query = {'user_id': str(request.user.id)}
    if unread_only:
        filter_query['is_read'] = False
    
    total_count = notifications_collection.count_documents(filter_query)
    
    return Response({
        'results': notifications,
        'count': total_count,
        'pages': (total_count + limit - 1) // limit,
        'current_page': page
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Bildirimi okundu olarak işaretler
    """
    try:
        Notification.mark_as_read(notification_id)
        return Response({'status': 'success'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_fcm_notification(request):
    """
    FCM (Firebase Cloud Messaging) üzerinden bildirim gönderir
    """
    fcm_token = request.data.get('fcm_token')
    title = request.data.get('title')
    body = request.data.get('body')
    data = request.data.get('data', {})
    
    if not all([fcm_token, title, body]):
        return Response(
            {'error': 'FCM token, title ve body alanları gereklidir'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # FCM bildirim formatı
    fcm_data = {
        'to': fcm_token,
        'notification': {
            'title': title,
            'body': body,
            'sound': 'default',
            'badge': '1'
        },
        'data': data,
        'priority': 'high'
    }
    
    # FCM isteği gönder
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'key={settings.NOTIFICATION_SETTINGS["FIREBASE_API_KEY"]}'
    }
    
    try:
        response = requests.post(
            settings.NOTIFICATION_SETTINGS['FCM_URL'],
            headers=headers,
            data=json.dumps(fcm_data)
        )
        
        # Yanıtı kontrol et
        fcm_response = response.json()
        if fcm_response.get('success') == 1:
            return Response({'status': 'success', 'response': fcm_response})
        else:
            return Response(
                {'error': 'FCM bildirimi gönderilemedi', 'response': fcm_response},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 