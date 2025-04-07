import requests
import json

# API endpoint'i
API_URL = "http://127.0.0.1:8000/api"

# Test kullanıcısı verisi
test_user = {
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "Test123456",
    "blood_type": "A+",
    "city": "İstanbul",
    "district": "Kadıköy"
}

try:
    # Kullanıcı kaydı yap
    print("Kullanıcı kaydı yapılıyor...")
    response = requests.post(f"{API_URL}/users/register/", json=test_user)
    
    print(f"Durum Kodu: {response.status_code}")
    print(f"Yanıt: {response.text}")
    
    if response.status_code == 201:
        print("Kullanıcı başarıyla oluşturuldu!")
    else:
        print("Kullanıcı oluşturma başarısız")
        
except Exception as e:
    print(f"Hata: {e}")
