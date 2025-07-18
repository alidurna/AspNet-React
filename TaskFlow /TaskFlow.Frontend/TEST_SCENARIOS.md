# TaskFlow Güvenlik Test Senaryoları

## 🧪 **Test Senaryoları**

### **1. İki Faktörlü Kimlik Doğrulama (2FA) Testleri**

#### **Senaryo 1.1: 2FA Etkinleştirme**
1. Kullanıcı `/security` sayfasına gider
2. "İki Faktörlü Kimlik Doğrulama" bölümünde şifresini girer
3. "2FA Etkinleştir" butonuna tıklar
4. QR kod görüntülenir
5. Manuel kod da gösterilir
6. Doğrulama kodu girer
7. "Doğrula ve Etkinleştir" butonuna tıklar
8. 2FA başarıyla etkinleştirilir

#### **Senaryo 1.2: 2FA Devre Dışı Bırakma**
1. 2FA etkin kullanıcı `/security` sayfasına gider
2. Şifresini ve doğrulama kodunu girer
3. "2FA Devre Dışı Bırak" butonuna tıklar
4. 2FA başarıyla devre dışı bırakılır

#### **Senaryo 1.3: Kurtarma Kodları Oluşturma**
1. 2FA etkin kullanıcı `/security` sayfasına gider
2. "Kurtarma Kodları Oluştur" butonuna tıklar
3. 10 adet kurtarma kodu görüntülenir
4. Kodlar güvenli bir yere kaydedilir

### **2. Biyometrik Giriş (WebAuthn) Testleri**

#### **Senaryo 2.1: Biyometrik Giriş Kurulumu**
1. Kullanıcı `/security` sayfasına gider
2. "Biyometrik Giriş" bölümünde cihaz adını girer
3. "Biyometrik Giriş Kur" butonuna tıklar
4. Tarayıcı biyometrik doğrulama ister
5. Parmak izi veya yüz tanıma ile doğrular
6. Biyometrik giriş başarıyla kurulur

#### **Senaryo 2.2: Yeni Cihaz Ekleme**
1. Biyometrik giriş kurulu kullanıcı `/security` sayfasına gider
2. "Yeni Cihaz Adı" alanına ad girer
3. "Yeni Cihaz Ekle" butonuna tıklar
4. Yeni cihaz için biyometrik doğrulama yapar
5. Cihaz listesinde yeni cihaz görünür

#### **Senaryo 2.3: Cihaz Silme**
1. Kullanıcı `/security` sayfasına gider
2. Kayıtlı cihazlar listesinde "Sil" butonuna tıklar
3. Cihaz başarıyla silinir
4. Cihaz listeden kaldırılır

### **3. Güvenlik Durumu Kontrolü**

#### **Senaryo 3.1: Güvenlik Durumu Görüntüleme**
1. Kullanıcı `/security` sayfasına gider
2. 2FA durumu görüntülenir (Aktif/Pasif)
3. Biyometrik giriş durumu görüntülenir (Aktif/Pasif)
4. Kayıtlı cihazlar listesi görüntülenir

### **4. Hata Senaryoları**

#### **Senaryo 4.1: Yanlış Şifre**
1. Kullanıcı 2FA etkinleştirirken yanlış şifre girer
2. Hata mesajı gösterilir
3. İşlem iptal edilir

#### **Senaryo 4.2: Yanlış Doğrulama Kodu**
1. Kullanıcı yanlış 6 haneli kodu girer
2. Hata mesajı gösterilir
3. Tekrar deneme imkanı verilir

#### **Senaryo 4.3: Biyometrik Giriş Desteklenmeyen Tarayıcı**
1. Eski tarayıcıda biyometrik giriş kurulmaya çalışılır
2. "Bu tarayıcı biyometrik girişi desteklemiyor" mesajı gösterilir

## 🔧 **Test Ortamı**

### **Backend**
- URL: `http://localhost:5281`
- Swagger: `http://localhost:5281/swagger`

### **Frontend**
- URL: `http://localhost:3001`
- Güvenlik Sayfası: `http://localhost:3001/security`

### **Gerekli Araçlar**
- Google Authenticator (2FA test için)
- Biyometrik destekli cihaz (WebAuthn test için)
- Modern tarayıcı (Chrome, Firefox, Safari)

## 📋 **Test Checklist**

### **2FA Testleri**
- [ ] 2FA etkinleştirme
- [ ] QR kod görüntüleme
- [ ] Manuel kod gösterimi
- [ ] Doğrulama kodu girişi
- [ ] 2FA devre dışı bırakma
- [ ] Kurtarma kodları oluşturma
- [ ] Hata durumları

### **WebAuthn Testleri**
- [ ] Biyometrik giriş kurulumu
- [ ] Yeni cihaz ekleme
- [ ] Cihaz silme
- [ ] Cihaz listesi görüntüleme
- [ ] Tarayıcı uyumluluğu

### **Genel Testler**
- [ ] Sayfa yükleme
- [ ] Responsive tasarım
- [ ] Loading state'leri
- [ ] Error handling
- [ ] Toast bildirimleri
- [ ] Navigation

## 🐛 **Bilinen Sorunlar**

1. **WebAuthn**: Sadece HTTPS üzerinde çalışır (production'da)
2. **2FA**: Gerçek cihaz gerektirir (emülatör çalışmaz)
3. **Biyometrik**: Tarayıcı desteği gerekli

## ✅ **Başarı Kriterleri**

- [ ] Tüm 2FA işlemleri başarıyla çalışır
- [ ] WebAuthn kurulumu ve yönetimi çalışır
- [ ] Hata durumları düzgün handle edilir
- [ ] UI/UX kullanıcı dostu
- [ ] Responsive tasarım çalışır
- [ ] Performance kabul edilebilir seviyede 