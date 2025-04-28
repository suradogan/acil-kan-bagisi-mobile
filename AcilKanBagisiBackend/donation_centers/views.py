from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import DonationCenter
from .serializers import DonationCenterSerializer
import math
import pymongo
import traceback
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def get_donation_centers(request):
    """Get all donation centers"""
    try:
        centers = DonationCenter.objects.filter(is_active=True)
        serializer = DonationCenterSerializer(centers, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Get donation centers error: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_nearby_centers(request):
    """Get donation centers near a location"""
    try:
        user_lat = float(request.query_params.get('latitude', 0))
        user_lng = float(request.query_params.get('longitude', 0))
        radius = int(request.query_params.get('radius', 10))  # km cinsinden

        if user_lat == 0 or user_lng == 0:
            return Response({"error": "Latitude ve longitude parametreleri gereklidir"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        centers = DonationCenter.objects.filter(is_active=True)
        nearby_centers = []

        for center in centers:
            # İki nokta arasındaki mesafeyi Haversine formülüyle hesapla
            distance = calculate_distance(user_lat, user_lng, center.latitude, center.longitude)
            
            if distance <= radius:
                serializer = DonationCenterSerializer(center)
                center_data = serializer.data
                center_data['distance'] = round(distance, 2)
                nearby_centers.append(center_data)
        
        # En yakından uzağa doğru sırala
        nearby_centers.sort(key=lambda x: x['distance'])
        
        return Response(nearby_centers)
    except Exception as e:
        print(f"Get nearby centers error: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Haversine formülü kullanarak iki koordinat arasındaki mesafeyi km cinsinden hesaplar
    """
    R = 6371  # Dünya'nın yarıçapı (km)
    
    # Radyan cinsine çevir
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Enlem ve boylam farkları
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formülü
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_donation_center(request):
    """Add a new donation center (admin only)"""
    try:
        serializer = DonationCenterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # MongoDB'ye de kaydet
            try:
                mongo_uri = "mongodb+srv://sura:sura123@cluster0.e2iejbs.mongodb.net/acilkan?retryWrites=true&w=majority&appName=Cluster0"
                client = pymongo.MongoClient(mongo_uri)
                db = client['acilkan']
                centers_collection = db['donation_centers']
                
                center_data = serializer.data
                centers_collection.insert_one(center_data)
                print(f"Donation center added to MongoDB: {center_data['name']}")
            except Exception as e:
                print(f"MongoDB donation center error: {str(e)}")
                print(traceback.format_exc())
                # MongoDB hatası ana işlemi engellemeyecek
                pass
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Add donation center error: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 