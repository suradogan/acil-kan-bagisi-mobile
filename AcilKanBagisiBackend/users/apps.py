from django.apps import AppConfig
from django.conf import settings

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    
    def ready(self):
        # MongoDB bağlantısını sağla
        if hasattr(settings, 'connect_to_mongodb'):
            settings.connect_to_mongodb()
