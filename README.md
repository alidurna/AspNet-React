# 🚀 ASP.NET + React Projeleri

Bu repository, **ASP.NET Core** backend ve **React** frontend teknolojilerini birleştiren modern web uygulamaları koleksiyonudur.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Projeler](#projeler)
- [Teknoloji Stack](#teknoloji-stack)
- [Kurulum](#kurulum)
- [Geliştirme](#geliştirme)
- [Deployment](#deployment)
- [Katkıda Bulunma](#katkıda-bulunma)

## 🎯 Genel Bakış

Bu repository, modern web geliştirme pratiklerini kullanarak **full-stack** uygulamalar geliştirmek için tasarlanmıştır. Her proje, **ASP.NET Core** backend API'si ve **React** frontend uygulamasından oluşur.

### 🎨 Mimari Yaklaşım
- **Backend**: ASP.NET Core Web API (RESTful)
- **Frontend**: React + TypeScript
- **Veritabanı**: PostgreSQL / SQL Server
- **Authentication**: JWT + OAuth
- **Real-time**: SignalR
- **Containerization**: Docker

## 📁 Projeler



## 🛠️ Teknoloji Stack

### Backend Teknolojileri
```csharp
// ASP.NET Core 8
- .NET 8.0
- Entity Framework Core
- AutoMapper
- FluentValidation
- Serilog
- Swagger/OpenAPI
- SignalR
- JWT Authentication
- OAuth 2.0
- WebAuthn
```

### Frontend Teknolojileri
```typescript
// React 18 + TypeScript
- React 18 (Hooks, Suspense)
- TypeScript 5
- Vite (Build Tool)
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form
- Zustand (State Management)
- React Router 6
- Framer Motion
- Lucide React (Icons)
```

### Veritabanı & Cache
```yaml
Database:
  - PostgreSQL 15+
  - SQL Server 2022
  - Redis (Caching)
  - Entity Framework Core

Monitoring:
  - Prometheus
  - Grafana
  - Serilog
  - Health Checks
```

### DevOps & Deployment
```yaml
Containerization:
  - Docker
  - Docker Compose
  - Multi-stage builds

CI/CD:
  - GitHub Actions
  - Azure DevOps
  - Automated testing
  - Security scanning

Cloud:
  - Azure
  - AWS
  - Google Cloud
```

## 🚀 Kurulum

### Gereksinimler
- **.NET 8.0 SDK**
- **Node.js 18+**
- **PostgreSQL 15+** veya **SQL Server 2022**
- **Docker** (opsiyonel)
- **Git**

### Hızlı Başlangıç

#### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/alidurna/AspNet-React.git
cd AspNet-React
```

#### 2. Proje Seçin
```bash
# TaskFlow projesi için
cd TaskFlow
```

#### 3. Backend Kurulumu
```bash
# API projesine gidin
cd TaskFlow.API

# Bağımlılıkları yükleyin
dotnet restore

# Veritabanı migration'larını çalıştırın
dotnet ef database update

# Uygulamayı çalıştırın
dotnet run
```

#### 4. Frontend Kurulumu
```bash
# Frontend projesine gidin
cd TaskFlow.Frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

#### 5. Docker ile Kurulum (Opsiyonel)
```bash
# Tüm servisleri Docker ile başlatın
docker-compose up -d

# Veya sadece backend
docker-compose up backend

# Veya sadece frontend
docker-compose up frontend
```

## 💻 Geliştirme

### Backend Geliştirme
```bash
# API projesini çalıştırın
cd TaskFlow.API
dotnet run

# Swagger UI: http://localhost:5000/swagger
# Health Check: http://localhost:5000/health
```

### Frontend Geliştirme
```bash
# Frontend projesini çalıştırın
cd TaskFlow.Frontend
npm run dev

# Uygulama: http://localhost:5173
```

### Test Çalıştırma
```bash
# Backend testleri
cd TaskFlow.Tests
dotnet test

# Frontend testleri
cd TaskFlow.Frontend
npm run test

# E2E testleri
npm run test:e2e
```

### Kod Kalitesi
```bash
# Backend linting
dotnet format
dotnet build --no-restore

# Frontend linting
npm run lint
npm run type-check
```

## 🚀 Deployment

### Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Staging build
docker-compose -f docker-compose.staging.yml up -d
```

### Kubernetes Deployment
```bash
# Namespace oluşturun
kubectl create namespace taskflow

# Deployment'ları uygulayın
kubectl apply -f k8s/

# Servisleri kontrol edin
kubectl get pods -n taskflow
```

### Cloud Deployment
```bash
# Azure
az webapp up --name taskflow-api --runtime "DOTNETCORE:8.0"

# AWS
aws ecs create-service --cluster taskflow --service-name taskflow-api

# Google Cloud
gcloud run deploy taskflow-api --source .
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# API Health
curl http://localhost:5000/health

# Database Health
curl http://localhost:5000/health/db

# Redis Health
curl http://localhost:5000/health/redis
```

### Logging
```bash
# Serilog ile yapılandırılmış
# Logs: /logs/app-{Date}.log
# Structured logging destekli
```

### Metrics
```bash
# Prometheus metrics
curl http://localhost:5000/metrics

# Custom metrics
curl http://localhost:5000/metrics/custom
```

## 🔒 Security

### Authentication
- **JWT Tokens**: Access ve Refresh token'ları
- **OAuth 2.0**: Google, Microsoft, GitHub entegrasyonu
- **WebAuthn**: Biyometrik giriş desteği
- **2FA**: İki faktörlü kimlik doğrulama

### Authorization
- **Role-based Access Control (RBAC)**
- **Policy-based Authorization**
- **Resource-based Permissions**

### Security Headers
```csharp
// Güvenlik header'ları otomatik olarak eklenir
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
```

## 🤝 Katkıda Bulunma

### Katkı Süreci
1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** yapın (`git commit -m 'Add amazing feature'`)
4. **Push** yapın (`git push origin feature/amazing-feature`)
5. **Pull Request** oluşturun

### Kod Standartları
- **Backend**: C# coding conventions
- **Frontend**: ESLint + Prettier
- **Commit Messages**: Conventional Commits
- **Documentation**: XML comments + README

### Test Gereksinimleri
- **Unit Tests**: %80+ coverage
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load testing

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- **ASP.NET Core** ekibine
- **React** ekibine
- **Tailwind CSS** ekibine
- **Tüm katkıda bulunanlara**
---

**⭐ Bu repository'yi beğendiyseniz yıldız vermeyi unutmayın!**

**🔄 Güncellemeler için Watch'a tıklayın!**

**🤝 Katkıda bulunmak için Fork yapın!** 
