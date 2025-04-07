import pymongo

# MongoDB bağlantı bilgileri
MONGODB_URI = "mongodb+srv://sura:sura123@cluster0.e2iejbs.mongodb.net/acilkan?retryWrites=true&w=majority&appName=Cluster0"

try:
    # Doğrudan bağlantı kur
    print("MongoDB Atlas'a bağlanılıyor...")
    client = pymongo.MongoClient(MONGODB_URI)
    
    # Bağlantıyı test et
    client.admin.command('ping')
    print("Ping başarılı! MongoDB Atlas'a bağlantı kuruldu.")
    
    # Veritabanı ve koleksiyon oluştur
    db = client['acilkan']
    users_collection = db['users']
    
    # Test verisi ekle
    test_user = {
        'email': 'manuel_test@example.com',
        'full_name': 'Manuel Test Kullanıcı',
        'blood_type': 'A+',
        'is_active': True
    }
    
    result = users_collection.insert_one(test_user)
    print(f"Test kullanıcısı eklendi. ID: {result.inserted_id}")
    
    # Koleksiyondaki tüm kullanıcıları göster
    print("\nMevcut kullanıcılar:")
    for user in users_collection.find():
        print(user)
    
except Exception as e:
    print(f"Hata oluştu: {e}")
