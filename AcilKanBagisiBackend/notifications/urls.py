from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.get_user_notifications, name='user_notifications'),
    path('<str:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('send/fcm/', views.send_fcm_notification, name='send_fcm_notification'),
] 