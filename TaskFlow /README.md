# 🎯 TaskFlow

**Modern Fullstack Görev Yönetimi Uygulaması**

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue.svg)](https://sqlite.org/)
[![Redux](https://img.shields.io/badge/State-Redux%20Toolkit-purple.svg)](https://redux-toolkit.js.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-brightgreen.svg)](https://swagger.io/)

---

## 📋 İçindekiler

- [🎯 Proje Hakkında](#-proje-hakkında)
- [🖼️ Ekran Görüntüleri](#️-ekran-görüntüleri)
- [✨ Özellikler](#-özellikler)
- [🛠️ Teknolojiler](#️-teknolojiler)
- [🚀 Kurulum](#-kurulum)
- [📁 Proje Yapısı](#-proje-yapısı)
- [📖 API Dokümantasyonu](#-api-dokümantasyonu)
- [🧪 Test Etme](#-test-etme)
- [🔐 Authentication](#-authentication)
- [📊 API Endpoints](#-api-endpoints)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)
- [📞 İletişim & Destek](#-iletişim--destek)

---

## 🎯 Proje Hakkında

TaskFlow, modern web uygulamaları için geliştirilmiş, React + TypeScript frontend ve ASP.NET Core 9 backend ile tam özellikli bir görev yönetimi platformudur. Kurumsal seviyede güvenlik, performans ve ölçeklenebilirlik sağlar.

---

## 🖼️ Ekran Görüntüleri

### 🔐 Giriş Ekranı
![TaskFlow Giriş Ekranı](https://github.com/user-attachments/assets/009ce77c-f645-44a8-b191-d7e8d21393a6)
*Modern ve kullanıcı dostu giriş arayüzü - Email/şifre ile giriş ve sosyal medya entegrasyonu*

### 📝 Kayıt Olma
![TaskFlow Kayıt Olma](https://github.com/user-attachments/assets/eb83c738-e32b-41bd-97d5-7d58d5f04468)
*Kapsamlı kullanıcı kayıt formu - Ad, soyad, email, telefon ve güvenlik onayları*

### 🔑 Şifre Sıfırlama
![TaskFlow Şifre Sıfırlama](https://github.com/user-attachments/assets/c559b3b3-5fd6-4826-b0d7-8493181e99aa)
*Güvenli şifre sıfırlama süreci - Email tabanlı doğrulama sistemi*

### 🏠 Ana Sayfa
![TaskFlow Ana Sayfa](./TaskFlow.Frontend/public/dashboard-screenshot.png)
*Dashboard ve görev yönetimi arayüzü - Modern ve responsive tasarım*

---

## ✨ Özellikler

- JWT tabanlı authentication
- Kullanıcı, görev, kategori yönetimi
- Gelişmiş arama ve filtreleme
- Otomatik mapping (AutoMapper)
- Soft delete, audit trail, validation
- Swagger/OpenAPI dokümantasyonu
- Responsive ve modern UI/UX (React + Tailwind)
- Redux Toolkit ile global state
- Zod ile form validation
- Toast notification sistemi
- Vitest ile unit testler

---

## 🛠️ Teknolojiler

### Backend

- ASP.NET Core 9, C# 13
- Entity Framework Core 9
- SQLite (development DB)
- AutoMapper
- JWT Bearer, BCrypt.Net
- Swagger/OpenAPI

### Frontend

- React 18, TypeScript 5
- Vite 6, Redux Toolkit 2.4
- React Router 7, Tailwind CSS 3.4
- Zod, React Hot Toast, Vitest

### DevOps & Tools

- Git, GitHub, ESLint, Prettier
- Postman, Docker (yakında)

---

## 🚀 Kurulum

### Backend

```bash
cd TaskFlow.API
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd TaskFlow.Frontend
npm install
npm run dev
```

---

## 📁 Proje Yapısı

```
TaskFlow/
├── README.md                       # Ana proje dokümantasyonu
├── TaskFlow.sln                    # Visual Studio solution
├── TaskFlow-Postman-Collection.json # API test collection
│
├── TaskFlow.API/                   # ASP.NET Core Backend
│   ├── Controllers/                # API Controllers
│   ├── Models/                     # Entity models
│   ├── Services/                   # Business logic
│   ├── Profiles/                   # AutoMapper profiles
│   ├── DTOs/                       # Data Transfer Objects
│   ├── Data/                       # DbContext & migrations
│   ├── Middleware/                 # Custom middleware
│   ├── Extensions/                 # Extension methods
│   ├── Hubs/                       # SignalR real-time hub
│   └── README.md                   # Backend dokümantasyonu
│
├── TaskFlow.Frontend/              # React TypeScript Frontend
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── pages/                  # Route pages
│   │   ├── store/                  # Redux store & slices
│   │   ├── schemas/                # Zod validation schemas
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API servisleri
│   │   ├── contexts/               # React context'leri
│   │   └── assets/                 # Statik dosyalar
│   ├── public/                     # Statik public dosyalar
│   └── README.md                   # Frontend dokümantasyonu
│
└── TaskFlow.Tests/                 # Test projects
    ├── Controllers/                # Controller tests
    ├── Services/                   # Service tests
    ├── Helpers/                    # Test yardımcıları
    └── README.md                   # Test dokümantasyonu
```

---

## 📖 API Dokümantasyonu

- **Swagger UI:** http://localhost:5280/swagger
- **API Base URL:** http://localhost:5280/api
- **Postman Collection:** `TaskFlow-Postman-Collection.json`

Tüm API response'ları standardized format kullanır:

```json
{
  "success": true,
  "message": "İşlem başarıyla tamamlandı",
  "data": {
    /* ... */
  },
  "errors": null,
  "timestamp": "2024-12-08T10:30:00Z"
}
```

---

## 🧪 Test Etme

### Backend

```bash
cd TaskFlow.API
dotnet test --verbosity normal
```

### Frontend

```bash
cd TaskFlow.Frontend
npm run test
npm run test:coverage
npm run test:ui
```

### API Testing (Postman)

1. `TaskFlow-Postman-Collection.json` dosyasını import et
2. Environment ayarlarını yap
3. Koleksiyonu çalıştır

---

## 🔐 Authentication

- JWT tabanlı authentication
- Tüm /api/todotasks ve /api/categories endpointleri JWT gerektirir
- Token: `Authorization: Bearer <token>`

---

## 📊 API Endpoints (Örnekler)

### Authentication

| Method | Endpoint            | Açıklama          | Auth |
| ------ | ------------------- | ----------------- | ---- |
| POST   | /api/users/register | Kullanıcı kaydı   | ❌   |
| POST   | /api/users/login    | Kullanıcı girişi  | ❌   |
| GET    | /api/users/profile  | Profil bilgileri  | ✅   |
| PUT    | /api/users/profile  | Profil güncelleme | ✅   |

### Categories

| Method | Endpoint             | Açıklama          | Auth |
| ------ | -------------------- | ----------------- | ---- |
| GET    | /api/categories      | Kategori listesi  | ✅   |
| POST   | /api/categories      | Kategori oluştur  | ✅   |
| PUT    | /api/categories/{id} | Kategori güncelle | ✅   |
| DELETE | /api/categories/{id} | Kategori sil      | ✅   |

### Tasks

| Method | Endpoint                 | Açıklama       | Auth |
| ------ | ------------------------ | -------------- | ---- |
| GET    | /api/tasks               | Görev listesi  | ✅   |
| POST   | /api/tasks               | Görev oluştur  | ✅   |
| GET    | /api/tasks/{id}          | Görev detayı   | ✅   |
| PUT    | /api/tasks/{id}          | Görev güncelle | ✅   |
| DELETE | /api/tasks/{id}          | Görev sil      | ✅   |
| PATCH  | /api/tasks/{id}/complete | Görev tamamla  | ✅   |

---

## 🤝 Katkıda Bulunma

1. Forkla
2. Branch oluştur (`git checkout -b feature/yenilik`)
3. Commit yap (`git commit -m 'feat: yenilik'`)
4. Push et (`git push origin feature/yenilik`)
5. Pull Request aç

### Katkı Kuralları

- Kod standartlarına uy
- Yeni özellik için test ekle
- Dokümantasyonu güncelle
- Conventional commit mesajı kullan

---

## 📄 Lisans

Bu proje **MIT** lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim & Destek

- 👨‍💻 Geliştirici: [Ali Durna](https://github.com/alidurna)
- 📧 Email: alidurna@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/alidurna/TaskFlow/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/alidurna/TaskFlow/discussions)

---

**⭐ Bu projeyi beğendiyseniz, lütfen yıldız verin!**
