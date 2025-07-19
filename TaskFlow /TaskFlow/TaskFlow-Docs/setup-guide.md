# 🚀 TaskFlow Kurulum Rehberi

Bu rehber, TaskFlow projesini local geliştirme ortamınızda çalıştırmak için gerekli tüm adımları içerir.

## 📋 İçindekiler

- [Gereksinimler](#gereksinimler)
- [Hızlı Kurulum](#hızlı-kurulum)
- [Detaylı Kurulum](#detaylı-kurulum)
- [Veritabanı Kurulumu](#veritabanı-kurulumu)
- [Konfigürasyon](#konfigürasyon)
- [Test Etme](#test-etme)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Gereksinimler

### Sistem Gereksinimleri
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: Minimum 8GB (16GB önerilen)
- **Disk**: Minimum 10GB boş alan
- **CPU**: Modern multi-core processor

### Yazılım Gereksinimleri

#### Backend (.NET)
- **.NET 8 SDK** (en son sürüm)
  - [Download .NET 8](https://dotnet.microsoft.com/download/dotnet/8.0)
  - Minimum versiyon: 8.0.100

#### Frontend (React)
- **Node.js** (18+ LTS)
  - [Download Node.js](https://nodejs.org/)
  - Minimum versiyon: 18.17.0
- **npm** (Node.js ile birlikte gelir)
  - Minimum versiyon: 9.0.0

#### Veritabanı
- **PostgreSQL** (14+)
  - [Download PostgreSQL](https://www.postgresql.org/download/)
  - Minimum versiyon: 14.0

#### Opsiyonel
- **Redis** (caching için)
  - [Download Redis](https://redis.io/download)
- **Docker** (container deployment için)
  - [Download Docker](https://www.docker.com/products/docker-desktop)

### IDE/Editor
- **Visual Studio 2022** (Windows)
- **Visual Studio Code** (Cross-platform)
- **JetBrains Rider** (Cross-platform)

## ⚡ Hızlı Kurulum

### 1. Repository Clone
```bash
git clone https://github.com/YOUR_USERNAME/TaskFlow.git
cd TaskFlow
```

### 2. Backend Kurulumu
```bash
cd TaskFlow.API
dotnet restore
dotnet ef database update
dotnet run
```

### 3. Frontend Kurulumu
```bash
cd TaskFlow.Frontend
npm install
npm run dev
```

### 4. Test Etme
```bash
# Backend tests
cd TaskFlow.API
dotnet test

# Frontend tests
cd TaskFlow.Frontend
npm run test
```

## 📝 Detaylı Kurulum

### 1. Repository Hazırlığı

#### Git Kurulumu
```bash
# Git kurulu değilse
# Windows: https://git-scm.com/download/win
# macOS: brew install git
# Ubuntu: sudo apt-get install git

# Git konfigürasyonu
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### Repository Clone
```bash
# HTTPS ile clone
git clone https://github.com/YOUR_USERNAME/TaskFlow.git

# SSH ile clone (önerilen)
git clone git@github.com:YOUR_USERNAME/TaskFlow.git

cd TaskFlow
```

### 2. .NET 8 SDK Kurulumu

#### Windows
```bash
# Chocolatey ile
choco install dotnet-8.0-sdk

# Manual download
# https://dotnet.microsoft.com/download/dotnet/8.0
```

#### macOS
```bash
# Homebrew ile
brew install dotnet

# Manual download
# https://dotnet.microsoft.com/download/dotnet/8.0
```

#### Ubuntu/Debian
```bash
# Microsoft repository ekleme
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

# .NET 8 SDK kurulumu
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

#### Kurulum Doğrulama
```bash
dotnet --version
# Çıktı: 8.0.100 veya üzeri olmalı
```

### 3. Node.js Kurulumu

#### Windows
```bash
# Chocolatey ile
choco install nodejs

# Manual download
# https://nodejs.org/
```

#### macOS
```bash
# Homebrew ile
brew install node

# nvm ile (önerilen)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Ubuntu/Debian
```bash
# NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Kurulum Doğrulama
```bash
node --version
# Çıktı: v18.17.0 veya üzeri olmalı

npm --version
# Çıktı: 9.0.0 veya üzeri olmalı
```

### 4. PostgreSQL Kurulumu

#### Windows
```bash
# Chocolatey ile
choco install postgresql

# Manual download
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Homebrew ile
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
# PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-14
```

#### PostgreSQL Konfigürasyonu
```bash
# PostgreSQL servisini başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL kullanıcısına geç
sudo -u postgres psql

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE taskflow;
CREATE USER taskflow_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflow_user;
\q
```

## 🗄️ Veritabanı Kurulumu

### 1. Connection String Konfigürasyonu

#### appsettings.Development.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=taskflow;Username=taskflow_user;Password=your_secure_password;Port=5432"
  }
}
```

### 2. Entity Framework Migration
```bash
cd TaskFlow.API

# Migration oluştur (ilk kez)
dotnet ef migrations add InitialCreate

# Veritabanını güncelle
dotnet ef database update

# Migration durumunu kontrol et
dotnet ef migrations list
```

### 3. Seed Data (Opsiyonel)
```bash
# Seed data çalıştır
dotnet run --seed-data
```

## ⚙️ Konfigürasyon

### 1. Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=Host=localhost;Database=taskflow;Username=taskflow_user;Password=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ISSUER=TaskFlow
JWT_AUDIENCE=TaskFlowUsers

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_SAMPLE_RATE=0.1
```

#### Frontend (.env.local)
```bash
# API
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000/hubs

# OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_ENDPOINT=/api/analytics
```

### 2. CORS Konfigürasyonu

#### Backend (Program.cs)
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 3. Authentication Konfigürasyonu

#### JWT Settings
```json
{
  "JwtSettings": {
    "SecretKey": "your_super_secret_jwt_key_here_minimum_32_characters",
    "Issuer": "TaskFlow",
    "Audience": "TaskFlowUsers",
    "ExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

## 🧪 Test Etme

### 1. Backend Testleri
```bash
cd TaskFlow.API

# Tüm testleri çalıştır
dotnet test

# Belirli test projesi
dotnet test TaskFlow.Tests

# Coverage ile test
dotnet test --collect:"XPlat Code Coverage"
```

### 2. Frontend Testleri
```bash
cd TaskFlow.Frontend

# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Coverage
npm run test:coverage
```

### 3. API Testleri
```bash
# Swagger UI
http://localhost:5000/swagger

# Postman Collection
# TaskFlow.postman_collection.json dosyasını import edin
```

### 4. Manual Testler
```bash
# Backend çalışıyor mu?
curl http://localhost:5000/api/health

# Frontend çalışıyor mu?
curl http://localhost:3000

# Veritabanı bağlantısı
dotnet ef database update --verbose
```

## 🚀 Uygulamayı Çalıştırma

### 1. Development Mode
```bash
# Terminal 1 - Backend
cd TaskFlow.API
dotnet run

# Terminal 2 - Frontend
cd TaskFlow.Frontend
npm run dev
```

### 2. Production Build
```bash
# Backend build
cd TaskFlow.API
dotnet publish -c Release -o ./publish

# Frontend build
cd TaskFlow.Frontend
npm run build
```

### 3. Docker ile Çalıştırma
```bash
# Docker Compose
docker-compose up -d

# Sadece backend
docker run -p 5000:5000 taskflow-api

# Sadece frontend
docker run -p 3000:3000 taskflow-frontend
```

## 🔧 Sorun Giderme

### Yaygın Sorunlar

#### 1. .NET SDK Bulunamadı
```bash
# .NET SDK kurulu mu kontrol et
dotnet --version

# PATH'e ekle
export PATH=$PATH:/usr/local/share/dotnet
```

#### 2. Node.js Versiyon Sorunu
```bash
# Node.js versiyonunu kontrol et
node --version

# nvm ile versiyon değiştir
nvm install 18
nvm use 18
```

#### 3. PostgreSQL Bağlantı Hatası
```bash
# PostgreSQL servisini kontrol et
sudo systemctl status postgresql

# Bağlantıyı test et
psql -h localhost -U taskflow_user -d taskflow
```

#### 4. Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000

# Process'i sonlandır
kill -9 <PID>
```

#### 5. Migration Hatası
```bash
# Veritabanını sıfırla
dotnet ef database drop --force
dotnet ef database update

# Migration'ları temizle
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
```

### Debug Modunda Çalıştırma

#### Backend Debug
```bash
cd TaskFlow.API
dotnet run --environment Development
```

#### Frontend Debug
```bash
cd TaskFlow.Frontend
npm run dev -- --debug
```

### Log Dosyaları
```bash
# Backend logs
tail -f TaskFlow.API/logs/app.log

# Frontend logs
tail -f TaskFlow.Frontend/logs/dev.log
```

## 📞 Destek

### Yardım Kaynakları
- **GitHub Issues**: Bug raporları
- **GitHub Discussions**: Genel sorular
- **Documentation**: Detaylı dokümantasyon
- **Stack Overflow**: Topluluk desteği

### İletişim
- **Email**: support@taskflow.com
- **Discord**: TaskFlow Community
- **Slack**: TaskFlow Developers

---

**Son Güncelleme**: 2024-12-19  
**Versiyon**: 1.0.0  
**Durum**: ✅ Test Edildi 