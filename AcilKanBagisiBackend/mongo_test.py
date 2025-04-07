from mongoengine import connect, Document, StringField
import pymongo

# MongoDB Atlas bağlantı string'i
MONGODB_URI = "mongodb+srv://sura:sura123@cluster0.e2iejbs.mongodb.net/acilkan?retryWrites=true&w=majority&appName=Cluster0"

# Bağlantıyı test etmek için basit bir model
class TestModel(Document):
    name = StringField(required=True)
    meta = {'collection': 'test_collection'}

try:
    # MongoDB'ye bağlan
    print("MongoDB bağlantısı kuruluyor...")
    connection = connect(db="acilkan", host=MONGODB_URI)
    
    # Bağlantıyı test et
    print("Ping komutu çalıştırılıyor...")
    connection.admin.command('ping')
    print("MongoDB Atlas'a başarıyla bağlandı!")
    
    # Koleksiyonları listele
    db = connection["acilkan"]
    collections = db.list_collection_names()
    print(f"Mevcut koleksiyonlar: {collections}")
    
    # Test modelini oluştur ve kaydet
    test_obj = TestModel(name="Test Entry")
    test_obj.save()
    print(f"Test verisi kaydedildi! ID: {test_obj.id}")
    
except Exception as e:
    print(f"MongoDB bağlantı hatası: {e}")
