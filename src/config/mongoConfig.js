/**
 * MongoDB Atlas Konfigürasyonu
 * 
 * Bu dosya hem web hem de mobil uygulamanın ortak kullanacağı 
 * MongoDB Atlas bağlantı ayarlarını içerir.
 */

// MongoDB Atlas URL'si - bu değeri kendi MongoDB Atlas hesabınızdaki connection string ile değiştirin
const MONGODB_URI = "mongodb+srv://sura:islim123@cluster0.n9pj5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Veritabanı ismi
const DB_NAME = "acilKanBagisi";

// Koleksiyon isimleri - hem web hem de mobil uygulamada aynı koleksiyon isimleri kullanılacak
const COLLECTIONS = {
  USERS: "users",
  EMERGENCY_REQUESTS: "emergencyRequests",
  DONATIONS: "donations",
  HOSPITALS: "hospitals",
  APPOINTMENTS: "appointments",
  SYNC_LOGS: "syncLogs"
};

// Veritabanı şeması - hem web hem de mobil uygulamada aynı şema kullanılacak
const SCHEMAS = {
  // Kullanıcı şeması
  USER: {
    name: String,
    email: String,
    password: String,
    bloodType: String,
    phone: String,
    city: String,
    district: String,
    lastDonationDate: Date,
    role: { 
      type: String, 
      enum: ['donor', 'hospital', 'admin'],
      default: 'donor'
    },
    createdAt: Date,
    updatedAt: Date
  },

  // Acil kan ihtiyacı şeması
  EMERGENCY_REQUEST: {
    hospitalId: String,
    hospitalName: String,
    bloodType: String,
    quantity: Number,
    urgencyLevel: { 
      type: Number, 
      min: 1, 
      max: 3 
    },
    description: String,
    contactInfo: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    expiresAt: Date,
    isFulfilled: { 
      type: Boolean, 
      default: false 
    },
    responders: [String], // Yanıt veren donör ID'leri
    createdAt: Date,
    updatedAt: Date
  },

  // Bağış kaydı şeması
  DONATION: {
    donorId: String,
    hospitalId: String,
    hospitalName: String,
    bloodType: String,
    quantity: Number,
    donationDate: Date,
    notes: String,
    createdAt: Date,
    updatedAt: Date
  },

  // Hastane şeması
  HOSPITAL: {
    name: String,
    email: String,
    password: String,
    address: String,
    city: String,
    district: String,
    phone: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    availableBloodTypes: [String],
    createdAt: Date,
    updatedAt: Date
  },

  // Randevu şeması
  APPOINTMENT: {
    donorId: String,
    hospitalId: String,
    hospitalName: String,
    date: Date,
    time: String,
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled', 'missed'],
      default: 'scheduled'
    },
    bloodType: String,
    notes: String,
    createdAt: Date,
    updatedAt: Date
  },

  // Senkronizasyon logları için şema
  SYNC_LOG: {
    userId: String,
    deviceId: String,
    lastSyncDate: Date,
    pendingOperations: [
      {
        operation: String,
        collection: String,
        documentId: String,
        data: Object,
        status: String,
        createdAt: Date
      }
    ],
    createdAt: Date,
    updatedAt: Date
  }
};

// İndeksler - veritabanı performansını artırmak için
const INDEXES = {
  // Users koleksiyonu indeksleri
  USERS: [
    { key: { email: 1 }, unique: true },
    { key: { bloodType: 1 } },
    { key: { city: 1, district: 1 } }
  ],
  
  // Emergency Requests koleksiyonu indeksleri
  EMERGENCY_REQUESTS: [
    { key: { hospitalId: 1 } },
    { key: { bloodType: 1 } },
    { key: { urgencyLevel: -1 } },
    { key: { expiresAt: 1 } },
    { key: { 'location.city': 1, 'location.district': 1 } },
    { key: { createdAt: -1 } } // Son eklenen istekleri almak için
  ],
  
  // Donations koleksiyonu indeksleri
  DONATIONS: [
    { key: { donorId: 1 } },
    { key: { hospitalId: 1 } },
    { key: { donationDate: -1 } }
  ],
  
  // Hospitals koleksiyonu indeksleri
  HOSPITALS: [
    { key: { email: 1 }, unique: true },
    { key: { city: 1, district: 1 } },
    { key: { availableBloodTypes: 1 } }
  ],
  
  // Appointments koleksiyonu indeksleri
  APPOINTMENTS: [
    { key: { donorId: 1 } },
    { key: { hospitalId: 1 } },
    { key: { date: 1 } },
    { key: { status: 1 } }
  ]
};

// MongoDB Atlas ile ilgili yardımcı işlevler
const MongoDBConfig = {
  getConnectionURI: () => MONGODB_URI,
  getDbName: () => DB_NAME,
  getCollections: () => COLLECTIONS,
  getSchemas: () => SCHEMAS,
  getIndexes: () => INDEXES,
  
  // ObjectID'leri string'e dönüştüren yardımcı fonksiyon
  // Web ve mobil arasında veri tutarlılığı için kullanılacak
  formatObjectId: (document) => {
    if (!document) return null;
    
    // Objede _id varsa ve ObjectID tipindeyse
    if (document._id) {
      // Mobil uygulamada kolaylık için id alanını da ekle
      document.id = document._id.toString();
    }
    
    // Eğer belge bir dizi içeriyorsa
    if (Array.isArray(document)) {
      return document.map(doc => MongoDBConfig.formatObjectId(doc));
    }
    
    return document;
  }
};

export default MongoDBConfig; 