# 🚀 AspNet-React Collection

**Modern Fullstack Development Portfolio**

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![C#](https://img.shields.io/badge/C%23-13.0-green.svg)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue.svg)](https://sqlite.org/)
[![Redux](https://img.shields.io/badge/State-Redux%20Toolkit-purple.svg)](https://redux-toolkit.js.org/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

---

## 📋 İçindekiler

- [🎯 Hakkında](#-hakkında)
- [🛠️ Teknoloji Stack'i](#️-teknoloji-stacki)
- [📁 Projeler](#-projeler)
- [📸 TaskFlow UI Screenshots](#-taskflow-ui-screenshots)
- [🚀 Başlangıç](#-başlangıç)
- [📖 Dokümantasyon](#-dokümantasyon)
- [🧪 Test Etme](#-test-etme)
- [🔐 Güvenlik](#-güvenlik)
- [📊 Performans](#-performans)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)
- [📞 İletişim](#-iletişim)

---

## 🎯 Hakkında

Bu repository, modern web geliştirme teknolojilerini kullanarak oluşturulmuş **ASP.NET Core** ve **React** projelerinin koleksiyonudur. Her proje, enterprise seviyesinde güvenlik, performans ve ölçeklenebilirlik standartlarında geliştirilmiştir.

### 🌟 Öne Çıkan Özellikler

- **🔐 Enterprise Güvenlik**: JWT, 2FA, WebAuthn, Captcha
- **⚡ Yüksek Performans**: Optimized queries, caching, lazy loading
- **📱 Responsive Design**: Mobile-first approach
- **🧪 Comprehensive Testing**: Unit, integration, e2e tests
- **📊 Real-time Features**: SignalR integration
- **🎨 Modern UI/UX**: Tailwind CSS, Material Design principles

---

## 🛠️ Teknoloji Stack'i

### Backend Technologies
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **ASP.NET Core** | 9.0 | Modern web framework |
| **C#** | 13.0 | Type-safe programming language |
| **Entity Framework** | 9.0 | ORM for database operations |
| **SQLite** | 3.x | Lightweight database |
| **AutoMapper** | 12.x | Object mapping |
| **JWT Bearer** | - | Authentication |
| **BCrypt.Net** | - | Password hashing |
| **Swagger/OpenAPI** | - | API documentation |

### Frontend Technologies
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **React** | 18.3 | UI library |
| **TypeScript** | 5.6 | Type-safe JavaScript |
| **Vite** | 6.x | Build tool |
| **Redux Toolkit** | 2.4 | State management |
| **React Router** | 7.x | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **Zod** | - | Schema validation |
| **React Hot Toast** | - | Notifications |

### DevOps & Tools
| Araç | Açıklama |
|------|----------|
| **Git** | Version control |
| **GitHub** | Code hosting |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Postman** | API testing |
| **Vitest** | Unit testing |

---

## 📁 Projeler

### 🎯 TaskFlow - Görev Yönetimi Sistemi
**Modern task management platform with enterprise security**

![TaskFlow Giriş Ekranı](https://github.com/user-attachments/assets/009ce77c-f645-44a8-b191-d7e8d21393a6)

#### ✨ Özellikler
- 🔐 **Gelişmiş Güvenlik**: 2FA, WebAuthn, Captcha, Rate Limiting
- 📊 **Dashboard**: Real-time statistics and charts
- 🔍 **Gelişmiş Arama**: Global search with filters
- 📱 **Responsive Design**: Mobile-first approach
- 🎨 **Modern UI**: Tailwind CSS with dark/light themes
- ⚡ **Real-time**: SignalR integration for live updates

#### 🛠️ Teknolojiler
- **Backend**: ASP.NET Core 9, Entity Framework, JWT
- **Frontend**: React 18, TypeScript, Redux Toolkit
- **Database**: SQLite with migrations
- **Testing**: Unit tests, Integration tests, E2E tests

#### 📖 [TaskFlow Detayları →](./TaskFlow/README.md)

---

## 📸 TaskFlow UI Screenshots

### 🔐 Giriş Ekranı
![TaskFlow Giriş Ekranı](https://github.com/user-attachments/assets/009ce77c-f645-44a8-b191-d7e8d21393a6)
*Modern ve kullanıcı dostu giriş arayüzü - Email/şifre ile giriş ve sosyal medya entegrasyonu*

### 📝 Kayıt Olma
![TaskFlow Kayıt Olma](https://github.com/user-attachments/assets/eb83c738-e32b-41bd-97d5-7d58d5f04468)
*Kapsamlı kullanıcı kayıt formu - Ad, soyad, email, telefon ve güvenlik onayları*

### 🔑 Şifre Sıfırlama
![TaskFlow Şifre Sıfırlama](https://github.com/user-attachments/assets/c559b3b3-5fd6-4826-b0d7-8493181e99aa)
*Güvenli şifre sıfırlama süreci - Email tabanlı doğrulama sistemi*

---

## 🚀 Başlangıç

### Gereksinimler
- **.NET 9.0 SDK**
- **Node.js 18+**
- **Git**

### Kurulum

#### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/alidurna/AspNet-React.git
cd AspNet-React
```

#### 2. Backend Kurulumu
```bash
# TaskFlow Backend
cd TaskFlow.API
dotnet restore
dotnet ef database update
dotnet run
```

#### 3. Frontend Kurulumu
```bash
# TaskFlow Frontend
cd TaskFlow.Frontend
npm install
npm run dev
```

### 🏃‍♂️ Hızlı Başlangıç
```bash
# Tüm projeleri aynı anda çalıştır
./scripts/start-all.sh

# Sadece TaskFlow'u çalıştır
./scripts/start-taskflow.sh
```

---

## 📖 Dokümantasyon

### API Dokümantasyonu
- **Swagger UI**: http://localhost:5280/swagger
- **API Base URL**: http://localhost:5280/api
- **Postman Collection**: [TaskFlow Collection](./TaskFlow/TaskFlow-Postman-Collection.json)

### Proje Dokümantasyonu
- [TaskFlow Backend](./TaskFlow.API/README.md)
- [TaskFlow Frontend](./TaskFlow.Frontend/README.md)
- [TaskFlow Tests](./TaskFlow.Tests/README.md)

---

## 🧪 Test Etme

### Backend Tests
```bash
cd TaskFlow.API
dotnet test --verbosity normal
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Tests
```bash
cd TaskFlow.Frontend
npm run test
npm run test:coverage
npm run test:ui
```

### E2E Tests
```bash
cd TaskFlow.Frontend
npm run test:e2e
```

---

## 🔐 Güvenlik

### Implemented Security Features
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Two-Factor Authentication (2FA)** - Additional security layer
- ✅ **WebAuthn (Biometric)** - Passwordless authentication
- ✅ **Captcha Protection** - Bot prevention
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Password Hashing** - BCrypt with salt
- ✅ **CORS Configuration** - Cross-origin security
- ✅ **Input Validation** - XSS and injection prevention

### Security Best Practices
- 🔒 HTTPS enforcement
- 🔒 Secure headers configuration
- 🔒 SQL injection prevention
- 🔒 XSS protection
- 🔒 CSRF protection

---

## 📊 Performans

### Backend Optimizations
- ⚡ **Caching**: Redis-like caching system
- ⚡ **Database**: Optimized queries with indexes
- ⚡ **Compression**: Response compression
- ⚡ **Async/Await**: Non-blocking operations

### Frontend Optimizations
- ⚡ **Code Splitting**: Lazy loading of components
- ⚡ **Bundle Optimization**: Tree shaking and minification
- ⚡ **Image Optimization**: WebP format support
- ⚡ **Caching**: Service worker for offline support

---

## 🤝 Katkıda Bulunma

Bu projeye katkıda bulunmak istiyorsanız:

### 1. Fork Yapın
```bash
git clone https://github.com/your-username/AspNet-React.git
```

### 2. Branch Oluşturun
```bash
git checkout -b feature/amazing-feature
```

### 3. Değişikliklerinizi Commit Edin
```bash
git commit -m 'feat: add amazing feature'
```

### 4. Push Edin
```bash
git push origin feature/amazing-feature
```

### 5. Pull Request Açın

### 📋 Katkı Kuralları
- ✅ Kod standartlarına uyun
- ✅ Test yazın
- ✅ Dokümantasyonu güncelleyin
- ✅ Conventional commit mesajları kullanın

---

## 📄 Lisans

Bu proje **MIT** lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim

- 👨‍💻 **Geliştirici**: [Ali Durna](https://github.com/alidurna)
- 📧 **Email**: alidurna@example.com
- 🌐 **Website**: [Portfolio](https://alidurna.dev)
- 💼 **LinkedIn**: [Ali Durna](https://linkedin.com/in/alidurna)
- 🐦 **Twitter**: [@alidurna](https://twitter.com/alidurna)

### 🐛 Issues & Discussions
- 🐛 [GitHub Issues](https://github.com/alidurna/AspNet-React/issues)
- 💬 [GitHub Discussions](https://github.com/alidurna/AspNet-React/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=alidurna/AspNet-React&type=Date)](https://star-history.com/#alidurna/AspNet-React&Date)

---

**⭐ Bu repository'yi beğendiyseniz, lütfen yıldız verin!**

---

<div align="center">

**Made with ❤️ by [Ali Durna](https://github.com/alidurna)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/alidurna)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/alidurna)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/alidurna)

</div>
