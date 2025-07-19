# 🔧 API Dokümantasyonu

TaskFlow REST API'sinin kapsamlı dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](./overview.md)
- [Authentication](./authentication.md)
- [User Management](./user.md)
- [Task Management](./task.md)
- [Category Management](./category.md)
- [File Management](./file.md)
- [Analytics](./analytics.md)
- [WebAuthn](./webauthn.md)
- [Error Handling](./error-handling.md)
- [Rate Limiting](./rate-limiting.md)

## 🚀 Hızlı Başlangıç

### Base URL
```
Development: http://localhost:5000/api
Production:  https://api.taskflow.com/api
```

### Authentication
```bash
# JWT Token ile kimlik doğrulama
Authorization: Bearer <your-jwt-token>
```

### Content Type
```bash
Content-Type: application/json
```

## 📊 API Endpoints Özeti

### 🔐 Authentication
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/auth/register` | Kullanıcı kaydı |
| POST | `/auth/login` | Kullanıcı girişi |
| POST | `/auth/refresh` | Token yenileme |
| POST | `/auth/logout` | Çıkış yapma |
| POST | `/auth/forgot-password` | Şifre sıfırlama |
| POST | `/auth/reset-password` | Şifre sıfırlama onayı |

### 👤 User Management
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/users/profile` | Profil bilgileri |
| PUT | `/users/profile` | Profil güncelleme |
| PUT | `/users/password` | Şifre değiştirme |
| POST | `/users/avatar` | Avatar yükleme |
| GET | `/users/stats` | Kullanıcı istatistikleri |

### 📝 Task Management
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/tasks` | Görev listesi |
| POST | `/tasks` | Yeni görev oluşturma |
| GET | `/tasks/{id}` | Görev detayı |
| PUT | `/tasks/{id}` | Görev güncelleme |
| DELETE | `/tasks/{id}` | Görev silme |
| PUT | `/tasks/{id}/progress` | İlerleme güncelleme |
| POST | `/tasks/bulk-delete` | Toplu silme |
| POST | `/tasks/bulk-complete` | Toplu tamamlama |

### 📂 Category Management
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/categories` | Kategori listesi |
| POST | `/categories` | Yeni kategori |
| GET | `/categories/{id}` | Kategori detayı |
| PUT | `/categories/{id}` | Kategori güncelleme |
| DELETE | `/categories/{id}` | Kategori silme |

### 📁 File Management
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/files/upload` | Dosya yükleme |
| GET | `/files/{id}` | Dosya indirme |
| DELETE | `/files/{id}` | Dosya silme |
| GET | `/files` | Dosya listesi |

### 📊 Analytics
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/analytics/events` | Event gönderme |
| GET | `/analytics/dashboard` | Dashboard verileri |
| POST | `/analytics/errors` | Hata raporlama |
| POST | `/analytics/performance` | Performans metrikleri |

### 🔐 WebAuthn (Biyometrik)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/webauthn/register` | Credential kaydı |
| POST | `/webauthn/authenticate` | Biyometrik giriş |
| GET | `/webauthn/credentials` | Credential listesi |
| DELETE | `/webauthn/credentials/{id}` | Credential silme |

## 🔍 API Versiyonlama

### Versiyon Formatı
```
/api/v1/endpoint
```

### Mevcut Versiyonlar
- **v1**: Mevcut stabil API
- **v2**: Gelecek versiyon (planlanıyor)

### Breaking Changes
Breaking changes için yeni major versiyon kullanılır.

## 📝 Request/Response Formatları

### Standard Response Format
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": {
    // Response data
  },
  "timestamp": "2024-12-19T10:30:00Z",
  "version": "1.0.0"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Hata mesajı",
  "errors": [
    {
      "field": "email",
      "message": "Geçerli bir email adresi giriniz"
    }
  ],
  "timestamp": "2024-12-19T10:30:00Z",
  "version": "1.0.0"
}
```

## 🔒 Güvenlik

### Authentication
- **JWT Token**: Stateless authentication
- **Refresh Token**: Otomatik token yenileme
- **OAuth**: Google, Apple entegrasyonu
- **WebAuthn**: Biyometrik giriş

### Authorization
- **Role-based**: Admin, User, Guest
- **Resource-based**: Kullanıcı kendi verilerine erişim
- **Permission-based**: Detaylı izin sistemi

### Rate Limiting
- **Default**: 100 requests/minute
- **Auth endpoints**: 10 requests/minute
- **File upload**: 20 requests/minute

## 🧪 Testing

### Swagger UI
```
http://localhost:5000/swagger
```

### Postman Collection
```bash
# Collection import
TaskFlow.postman_collection.json
```

### Test Environment
```
Base URL: http://localhost:5000/api
Test Database: taskflow_test
```

## 📊 Monitoring

### Health Check
```bash
GET /api/health
```

### Metrics
```bash
GET /api/metrics
```

### Logs
- **Application logs**: `/logs/app.log`
- **Error logs**: `/logs/error.log`
- **Access logs**: `/logs/access.log`

## 🔄 WebSocket (SignalR)

### Hub Endpoints
```
/hubs/taskflow
```

### Real-time Events
- Task updates
- User notifications
- Analytics updates
- Dashboard updates

## 📞 Destek

### API Support
- **Email**: api-support@taskflow.com
- **Documentation**: Bu dokümantasyon
- **GitHub Issues**: API sorunları için

### SLA (Service Level Agreement)
- **Uptime**: %99.9
- **Response Time**: <200ms (95th percentile)
- **Support Response**: <4 hours

---

**Son Güncelleme**: 2024-12-19  
**API Versiyon**: v1.0.0  
**Durum**: ✅ Production Ready 