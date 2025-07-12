# 🚀 TaskFlow.API

**Modern ASP.NET Core 9 Görev Yönetimi REST API'si**

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
[![Entity Framework](https://img.shields.io/badge/Entity%20Framework-Core-green.svg)](https://docs.microsoft.com/en-us/ef/core/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue.svg)](https://sqlite.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-brightgreen.svg)](https://swagger.io/)

---

## 📋 İçindekiler

- [🎯 Proje Hakkında](#-proje-hakkında)
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

TaskFlow.API, modern web uygulamaları için geliştirilmiş, kurumsal seviyede güvenlik, performans ve ölçeklenebilirlik sunan bir görev yönetimi REST API'sidir. Tüm iş mantığı, veri yönetimi ve API endpointleri bu katmanda yer alır.

---

## ✨ Özellikler

- JWT tabanlı authentication
- Kullanıcı, görev, kategori yönetimi
- Gelişmiş arama ve filtreleme
- Otomatik mapping (AutoMapper)
- Soft delete, audit trail, validation
- Swagger/OpenAPI dokümantasyonu
- Global exception ve validation middleware
- Performanslı, test edilebilir, sürdürülebilir mimari

---

## 🛠️ Teknolojiler

- ASP.NET Core 9, C# 13
- Entity Framework Core 9
- SQLite (development DB)
- AutoMapper
- JWT Bearer, BCrypt.Net
- Swagger/OpenAPI
- Microsoft.Extensions.Logging

---

## 🚀 Kurulum

```bash
cd TaskFlow.API
dotnet restore
dotnet ef database update
dotnet run
```

- Swagger: http://localhost:5280/swagger
- API Base: http://localhost:5280/api

---

## 📁 Proje Yapısı

```
TaskFlow.API/
├── Controllers/   # API endpoint'leri
├── Models/        # Entity modelleri
├── DTOs/          # Veri transfer objeleri
├── Services/      # İş mantığı
├── Middleware/    # Custom middleware'ler
├── Profiles/      # AutoMapper profilleri
├── Data/          # DbContext ve migrations
├── Extensions/    # Extension method'lar
├── Hubs/          # SignalR real-time hub
├── appsettings.json
└── README.md
```

---

## 📖 API Dokümantasyonu

- **Swagger UI:** http://localhost:5280/swagger
- **API Base URL:** http://localhost:5280/api
- **Postman Collection:** Proje kökünde `TaskFlow-Postman-Collection.json`

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

```bash
cd TaskFlow.API
dotnet test --verbosity normal
```

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
