/**
 * MongoDB Atlas Konfigürasyon Örneği
 * 
 * Bu dosya backend tarafında yer alacak olan MongoDB Atlas bağlantısı için
 * gerekli konfigürasyonları içerir. React Native uygulaması bu konfigürasyonu
 * değil, konfigürasyonu kullanan backend API'sini kullanacaktır.
 * 
 * ÖNEMLİ: Bu örnek sadece referans amaçlıdır. Gerçek bağlantı bilgilerinizi
 * güvenli bir şekilde backend tarafında saklayın.
 */

// Django için settings.py içinde MongoDB Atlas Konfigürasyonu
/*
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'acilkanbagisi',
        'CLIENT': {
            'host': 'mongodb+srv://username:password@cluster.mongodb.net/acilkanbagisi?retryWrites=true&w=majority',
            'username': 'your_username',
            'password': 'your_password',
            'authMechanism': 'SCRAM-SHA-1',
        }
    }
}
*/

// Node.js için MongoDB Atlas bağlantı örneği
/*
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://username:password@cluster.mongodb.net/acilkanbagisi?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("MongoDB Atlas'a başarıyla bağlanıldı");
        return client.db("acilkanbagisi");
    } catch (error) {
        console.error("MongoDB bağlantısında hata:", error);
        throw error;
    }
}

module.exports = { connectToMongoDB, client };
*/

// Django DRF serializers.py örneği (MongoDB için)
/*
from rest_framework import serializers
from .models import User, BloodDonation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'bloodType', 'phone', 'lastDonationDate', 
                  'city', 'district', 'isActive', 'createdAt', 'updatedAt']
        
class BloodDonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodDonation
        fields = ['id', 'userId', 'donationDate', 'hospital', 'bloodType', 
                  'amount', 'notes', 'createdAt', 'isEmergency', 'isVerified']
*/

// MongoDB Atlas Dağıtım Adımları:
// 1. MongoDB Atlas hesabı oluşturun: https://www.mongodb.com/cloud/atlas
// 2. Yeni bir cluster oluşturun
// 3. Veritabanı erişimi için kullanıcı oluşturun
// 4. IP Whitelist'e uygulamanızın çalışacağı IP adreslerini ekleyin
// 5. Connection string'i alın ve güvenli bir şekilde saklayın
// 6. Backend uygulamanızda bu connection string ile MongoDB'ye bağlanın

// React Native uygulamanız bu veritabanına doğrudan erişmez,
// bunun yerine backend API'sini kullanarak erişir.

export const mongoDBInfo = {
  databaseName: 'acilkanbagisi',
  collections: {
    users: 'users',
    bloodDonations: 'bloodDonations',
    hospitals: 'hospitals',
    emergencyRequests: 'emergencyRequests',
    appointments: 'appointments',
  },
  // MongoDB Atlas Collection Yapısı
  schemas: {
    users: {
      name: "String",
      email: "String",
      password: "String",
      bloodType: "String",
      phone: "String",
      lastDonationDate: "Date",
      city: "String",
      district: "String",
      isActive: "Boolean",
      createdAt: "Date",
      updatedAt: "Date",
      notificationEnabled: "Boolean",
      locationEnabled: "Boolean",
    },
    bloodDonations: {
      userId: "ObjectId",
      donationDate: "Date",
      hospital: "String",
      bloodType: "String",
      amount: "Number",
      notes: "String",
      createdAt: "Date",
      location: "String",
      isEmergency: "Boolean",
      isVerified: "Boolean",
    },
    hospitals: {
      name: "String",
      address: "String",
      city: "String",
      district: "String",
      phone: "String",
      email: "String",
      location: "String",
      isActive: "Boolean",
      workingHours: "String",
      createdAt: "Date",
      updatedAt: "Date",
    },
    emergencyRequests: {
      hospitalId: "ObjectId",
      bloodType: "String",
      quantity: "Number",
      patientName: "String",
      patientAge: "Number",
      urgencyLevel: "Number",
      description: "String",
      createdAt: "Date",
      expiresAt: "Date",
      isFulfilled: "Boolean",
      fulfilledAt: "Date",
      responders: ["String"],
    },
    appointments: {
      userId: "ObjectId",
      hospitalId: "ObjectId",
      date: "Date",
      status: "String",
      notes: "String",
      reminderSent: "Boolean",
      createdAt: "Date",
      updatedAt: "Date",
    },
  },
};

export default mongoDBInfo; 