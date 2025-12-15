#  Odaklanma Takibi Uygulaması

Pomodoro tekniğine dayalı, dikkat dağınıklığını otomatik tespit eden mobil uygulama.

---

##  Gereksinimler

- Node.js 18 veya üzeri
- npm veya yarn

---

## Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin

npm install

### 2. Uygulamayı Başlatın

npx expo start


##  Sorun Giderme

Cache temizleyerek yeniden başlatın:


npx expo start -c

## 📂 Proje Yapısı

app/
├── (tabs)/
│   ├── index.tsx        # Zamanlayıcı ekranı
│   └── explore.tsx      # Raporlar ekranı
utils/
└── storage.ts           # Veri yönetimi

UMUT DİREK-B221210090
