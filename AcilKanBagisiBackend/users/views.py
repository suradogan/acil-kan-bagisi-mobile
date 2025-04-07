from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import json
import pymongo
import traceback
from django.conf import settings
from .models import CustomUser

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        print("Kayıt isteği alındı:", request.data)
        data = request.data
        
        # Zorunlu alanları kontrol et
        required_fields = ['email', 'full_name', 'password', 'blood_type']
        for field in required_fields:
            if field not in data:
                print(f"Eksik alan: {field}")
                return Response({'error': f'{field} alanı zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # E-posta adresi mevcut mu kontrol et
        if CustomUser.objects.filter(email=data['email']).exists():
            print(f"Email zaten kullanımda: {data['email']}")
            return Response({'error': 'Bu e-posta adresi zaten kullanılıyor.'}, status=status.HTTP_400_BAD_REQUEST)
        
        print("Django kullanıcısı oluşturuluyor...")
        # Kullanıcıyı oluştur
        user = CustomUser.objects.create_user(
            email=data['email'],
            password=data['password'],
            full_name=data['full_name'],
            blood_type=data['blood_type'],
            city=data.get('city', ''),
            district=data.get('district', ''),
            phone_number=data.get('phone_number', '')
        )
        print(f"Django kullanıcısı oluşturuldu: {user.email}")
        
        # MongoDB'ye doğrudan kaydet
        try:
            print("MongoDB'ye bağlanılıyor...")
            mongo_uri = "mongodb+srv://sura:sura123@cluster0.e2iejbs.mongodb.net/acilkan?retryWrites=true&w=majority&appName=Cluster0"
            client = pymongo.MongoClient(mongo_uri)
            db = client['acilkan']
            users_collection = db['users']
            
            user_data = {
                'email': data['email'],
                'full_name': data['full_name'],
                'blood_type': data['blood_type'],
                'city': data.get('city', ''),
                'district': data.get('district', ''),
                'phone_number': data.get('phone_number', ''),
                'is_active': True
            }
            
            print("MongoDB'ye veri yazılıyor:", user_data)
            result = users_collection.insert_one(user_data)
            print(f"MongoDB'ye kullanıcı kaydedildi: {result.inserted_id}")
        except Exception as e:
            print(f"MongoDB kayıt hatası: {e}")
            print(traceback.format_exc())
        
        return Response({
            'message': 'Kullanıcı başarıyla kaydedildi.',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'blood_type': user.blood_type
            }
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"Kayıt hatası: {e}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        print("Giriş isteği alındı:", request.data)
        data = request.data
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            print("Email veya şifre eksik")
            return Response({'error': 'E-posta ve şifre zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Kullanıcı doğrulanıyor: {email}")
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            print(f"Kullanıcı doğrulandı: {user.email}")
            # MongoDB'den kullanıcı bilgilerini al
            try:
                print("MongoDB'den kullanıcı bilgileri alınıyor...")
                mongo_uri = "mongodb+srv://sura:sura123@cluster0.e2iejbs.mongodb.net/acilkan?retryWrites=true&w=majority&appName=Cluster0"
                client = pymongo.MongoClient(mongo_uri)
                db = client['acilkan']
                users_collection = db['users']
                
                mongo_user = users_collection.find_one({'email': email})
                if mongo_user:
                    print(f"MongoDB'den kullanıcı bulundu: {mongo_user}")
                else:
                    print("MongoDB'de kullanıcı bulunamadı, sadece Django veritabanında var.")
            except Exception as e:
                print(f"MongoDB sorgusu hatası: {e}")
                print(traceback.format_exc())
            
            return Response({
                'message': 'Giriş başarılı.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'blood_type': user.blood_type
                },
                'access': 'mock-token-123456789'
            }, status=status.HTTP_200_OK)
        else:
            print("Geçersiz kullanıcı kimlik bilgileri")
            return Response({'error': 'Geçersiz e-posta veya şifre.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        print(f"Giriş hatası: {e}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
