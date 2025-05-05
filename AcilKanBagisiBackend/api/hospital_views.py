from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import HospitalSerializer
from .models import Hospital
import math

class HospitalViewSet(viewsets.ModelViewSet):
    """
    Hastane ve kan bağış merkezleri için API endpoint'leri
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Kullanıcının konumuna en yakın hastaneleri bulur.
        
        Parametreler:
        - latitude: Kullanıcının enlem değeri
        - longitude: Kullanıcının boylam değeri
        - radius: Kilometre cinsinden yarıçap (varsayılan: 10)
        """
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        radius = float(request.query_params.get('radius', 10.0))
        
        if not latitude or not longitude:
            return Response(
                {"error": "Konum bilgileri (latitude ve longitude) gereklidir."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            return Response(
                {"error": "Geçersiz konum değerleri."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tüm hastaneleri al
        hospitals = Hospital.objects.all()
        
        # Her hastane için mesafeyi hesapla
        hospitals_with_distance = []
        
        for hospital in hospitals:
            distance = calculate_distance(
                latitude, longitude,
                float(hospital.latitude), float(hospital.longitude)
            )
            
            # Sadece belirtilen yarıçap içindeki hastaneleri ekle
            if distance <= radius:
                hospital_data = HospitalSerializer(hospital).data
                hospital_data['distance'] = round(distance, 1)  # Mesafeyi 1 ondalık basamağa yuvarla
                hospitals_with_distance.append(hospital_data)
        
        # Mesafeye göre sırala
        hospitals_with_distance.sort(key=lambda x: x['distance'])
        
        return Response(hospitals_with_distance)
        
    @action(detail=True, methods=['get'])
    def donations(self, request, pk=None):
        """
        Belirli bir hastanedeki kan bağışlarını listeler
        """
        hospital = self.get_object()
        
        from donations.models import BloodDonation
        from donations.serializers import BloodDonationSerializer
        
        donations = BloodDonation.objects.filter(hospital=hospital)
        serializer = BloodDonationSerializer(donations, many=True)
        
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    def emergency_requests(self, request, pk=None):
        """
        Belirli bir hastanedeki acil kan ihtiyaçlarını listeler
        """
        hospital = self.get_object()
        
        from donations.models import EmergencyRequest
        from donations.serializers import EmergencyRequestSerializer
        
        requests = EmergencyRequest.objects.filter(hospital=hospital)
        serializer = EmergencyRequestSerializer(requests, many=True)
        
        return Response(serializer.data)

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    İki konum arasındaki mesafeyi kilometre cinsinden hesaplar (Haversine formülü)
    """
    # Dünya yarıçapı (km)
    R = 6371
    
    # Radyana dönüştür
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Enlem ve boylam farkları
    d_lat = lat2_rad - lat1_rad
    d_lon = lon2_rad - lon1_rad
    
    # Haversine formülü
    a = math.sin(d_lat/2) * math.sin(d_lat/2) + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(d_lon/2) * math.sin(d_lon/2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance 