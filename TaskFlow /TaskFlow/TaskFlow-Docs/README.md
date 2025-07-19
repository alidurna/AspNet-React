# 📚 TaskFlow Dokümantasyon

Bu klasör, TaskFlow projesinin detaylı teknik dokümantasyonunu içerir.

## 📋 İçindekiler

### 🚀 Başlangıç Rehberleri
- [Kurulum Rehberi](./setup-guide.md) - Proje kurulumu ve geliştirme ortamı
- [Hızlı Başlangıç](./quick-start.md) - 5 dakikada projeyi çalıştırma
- [Geliştirici Ortamı](./development-environment.md) - IDE kurulumu ve konfigürasyonu

### 🏗️ Mimari Dokümantasyonu
- [Sistem Mimarisi](./architecture/system-architecture.md) - Genel sistem tasarımı
- [Backend Mimarisi](./architecture/backend-architecture.md) - .NET Core mimarisi
- [Frontend Mimarisi](./architecture/frontend-architecture.md) - React mimarisi
- [Veritabanı Tasarımı](./architecture/database-design.md) - PostgreSQL şema tasarımı

### 🔧 API Dokümantasyonu
- [API Genel Bakış](./api/overview.md) - REST API genel bilgileri
- [Authentication API](./api/authentication.md) - Kimlik doğrulama endpoint'leri
- [User API](./api/user.md) - Kullanıcı yönetimi endpoint'leri
- [Task API](./api/task.md) - Görev yönetimi endpoint'leri
- [Category API](./api/category.md) - Kategori yönetimi endpoint'leri
- [File API](./api/file.md) - Dosya yönetimi endpoint'leri
- [Analytics API](./api/analytics.md) - Analytics endpoint'leri
- [WebAuthn API](./api/webauthn.md) - Biyometrik giriş endpoint'leri

### 🎨 Frontend Dokümantasyonu
- [Component Library](./frontend/components.md) - UI component'leri
- [State Management](./frontend/state-management.md) - Redux Toolkit kullanımı
- [Routing](./frontend/routing.md) - React Router konfigürasyonu
- [Styling](./frontend/styling.md) - Tailwind CSS kullanımı
- [Testing](./frontend/testing.md) - Frontend test stratejisi

### 🔒 Güvenlik Dokümantasyonu
- [Güvenlik Genel Bakış](./security/overview.md) - Güvenlik mimarisi
- [Authentication](./security/authentication.md) - Kimlik doğrulama sistemi
- [Authorization](./security/authorization.md) - Yetkilendirme sistemi
- [Data Protection](./security/data-protection.md) - Veri koruma
- [WebAuthn](./security/webauthn.md) - Biyometrik giriş güvenliği

### 📊 Analytics ve Monitoring
- [Analytics Sistemi](./analytics/overview.md) - Analytics mimarisi
- [User Behavior Tracking](./analytics/user-behavior.md) - Kullanıcı davranış takibi
- [Error Monitoring](./analytics/error-monitoring.md) - Hata izleme
- [Performance Metrics](./analytics/performance.md) - Performans metrikleri
- [Real-time Dashboard](./analytics/dashboard.md) - Gerçek zamanlı dashboard

### 🚀 Deployment ve DevOps
- [Deployment Rehberi](./deployment/overview.md) - Deployment stratejisi
- [Docker](./deployment/docker.md) - Container deployment
- [CI/CD](./deployment/ci-cd.md) - Continuous Integration/Deployment
- [Environment Configuration](./deployment/environment.md) - Ortam konfigürasyonu
- [Monitoring](./deployment/monitoring.md) - Production monitoring

### 🧪 Test Dokümantasyonu
- [Test Stratejisi](./testing/strategy.md) - Genel test yaklaşımı
- [Unit Tests](./testing/unit-tests.md) - Birim testleri
- [Integration Tests](./testing/integration-tests.md) - Entegrasyon testleri
- [E2E Tests](./testing/e2e-tests.md) - End-to-end testleri
- [Test Coverage](./testing/coverage.md) - Test kapsama oranı

### 📱 PWA ve Mobile
- [PWA Konfigürasyonu](./pwa/configuration.md) - Progressive Web App ayarları
- [Service Worker](./pwa/service-worker.md) - Service worker implementasyonu
- [Offline Support](./pwa/offline.md) - Çevrimdışı destek
- [Mobile Optimization](./pwa/mobile.md) - Mobil optimizasyon

### 🔧 Konfigürasyon
- [Environment Variables](./configuration/environment.md) - Ortam değişkenleri
- [Database Configuration](./configuration/database.md) - Veritabanı ayarları
- [Authentication Settings](./configuration/authentication.md) - Kimlik doğrulama ayarları
- [Caching Configuration](./configuration/caching.md) - Önbellek ayarları
- [Logging Configuration](./configuration/logging.md) - Loglama ayarları

### 📈 Performance
- [Performance Optimization](./performance/optimization.md) - Performans optimizasyonu
- [Caching Strategy](./performance/caching.md) - Önbellek stratejisi
- [Database Optimization](./performance/database.md) - Veritabanı optimizasyonu
- [Frontend Performance](./performance/frontend.md) - Frontend performansı
- [Monitoring](./performance/monitoring.md) - Performans izleme

### 🐛 Troubleshooting
- [Common Issues](./troubleshooting/common-issues.md) - Yaygın sorunlar
- [Debug Guide](./troubleshooting/debug.md) - Debug rehberi
- [Error Codes](./troubleshooting/error-codes.md) - Hata kodları
- [Log Analysis](./troubleshooting/logs.md) - Log analizi

## 🎯 Dokümantasyon Standartları

### Yazım Kuralları
- **Türkçe** dil kullanımı
- **Açık ve anlaşılır** ifadeler
- **Teknik terimler** için açıklamalar
- **Kod örnekleri** ile destekleme

### Format Standartları
- **Markdown** formatı
- **Başlık hiyerarşisi** (H1, H2, H3)
- **Kod blokları** için syntax highlighting
- **Görseller** için alt metinler

### Güncelleme Süreci
- **Her feature** için dokümantasyon güncelleme
- **API değişiklikleri** için endpoint dokümantasyonu
- **Breaking changes** için migration rehberi
- **Düzenli review** ve güncelleme

## 🔍 Dokümantasyon Arama

### Hızlı Başlangıç
- Yeni geliştirici misiniz? → [Kurulum Rehberi](./setup-guide.md)
- API kullanımı mı? → [API Genel Bakış](./api/overview.md)
- Güvenlik konuları mı? → [Güvenlik Genel Bakış](./security/overview.md)

### Geliştirici Kaynakları
- Component geliştirme → [Component Library](./frontend/components.md)
- Backend servis yazma → [Backend Mimarisi](./architecture/backend-architecture.md)
- Test yazma → [Test Stratejisi](./testing/strategy.md)

### DevOps ve Deployment
- Production deployment → [Deployment Rehberi](./deployment/overview.md)
- Monitoring setup → [Monitoring](./deployment/monitoring.md)
- Performance optimization → [Performance Optimization](./performance/optimization.md)

## 📞 Destek

### Dokümantasyon Sorunları
- **Eksik bilgi** varsa → GitHub Issue açın
- **Yanlış bilgi** varsa → Pull Request ile düzeltin
- **Önerileriniz** varsa → GitHub Discussion'da paylaşın

### Teknik Destek
- **Bug raporları** → GitHub Issues
- **Özellik istekleri** → GitHub Issues
- **Genel sorular** → GitHub Discussions

## 🔄 Güncelleme Geçmişi

| Tarih | Versiyon | Değişiklik |
|-------|----------|------------|
| 2024-12-19 | 1.0.0 | İlk dokümantasyon sürümü |
| 2024-12-18 | 0.9.0 | Analytics dokümantasyonu eklendi |
| 2024-12-17 | 0.8.0 | WebAuthn dokümantasyonu eklendi |

---

**Son Güncelleme**: 2024-12-19  
**Versiyon**: 1.0.0  
**Durum**: ✅ Aktif Geliştirme 