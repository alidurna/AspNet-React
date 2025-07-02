# 🎯 TaskFlow

**Modern Fullstack Görev Yönetimi Uygulaması**

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue.svg)](https://sqlite.org/)
[![Redux](https://img.shields.io/badge/State-Redux%20Toolkit-purple.svg)](https://redux-toolkit.js.org/)

**TaskFlow**, görev yönetimi için geliştirilmiş modern bir fullstack web uygulamasıdır. React TypeScript frontend ve ASP.NET Core 9 backend ile geliştirilmiştir. Kullanıcılar görevlerini kolaylıkla oluşturabilir, düzenleyebilir, kategorize edebilir ve gerçek zamanlı olarak takip edebilir.

---

## 🎥 **Demo & Canlı Uygulama**

- **🌐 Live Demo:** [TaskFlow App](https://taskflow-demo.azurewebsites.net) (Yakında)
- **📚 API Docs:** [Swagger Documentation](http://localhost:5280/swagger)
- **📮 Postman:** Import `TaskFlow-Postman-Collection.json` for testing

---

## ✨ **Özellikler**

### 🔐 **Authentication & Security**

- ✅ JWT token based authentication
- ✅ Güvenli şifre hash'leme (BCrypt)
- ✅ User isolation ve role-based access
- ✅ Automatic token refresh

### 📋 **Advanced Task Management**

- ✅ **Hierarchical Tasks** - Ana görev ve alt görevler
- ✅ **Smart Categories** - Renkli ve iconlu kategoriler
- ✅ **Priority System** - 4 seviye öncelik (Low → Critical)
- ✅ **Due Date Tracking** - Deadline ve overdue detection
- ✅ **Progress Tracking** - Completion percentage
- ✅ **Tag System** - Flexible etiketleme sistemi
- ✅ **Rich Notes** - Timestamped notlar

### 🔍 **Smart Search & Filtering**

- ✅ **Advanced Search** - Multi-criteria filtering
- ✅ **Tag-based Search** - Tag'lere göre filtreleme
- ✅ **Date Range Filtering** - Tarih aralığında arama
- ✅ **Status Filtering** - Completed, pending, overdue
- ✅ **Sorting** - Multiple fields ile flexible sorting
- ✅ **Pagination** - Performance optimized

### 📊 **Analytics & Dashboard**

- ✅ **Task Statistics** - Completion rates ve trends
- ✅ **Category Distribution** - Kategori bazlı analiz
- ✅ **Priority Analytics** - Öncelik dağılımı
- ✅ **Progress Tracking** - Haftalık/aylık özet

### 🎨 **Modern UI/UX**

- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark/Light Theme** - Automatic sistem theme detection
- ✅ **Toast Notifications** - User feedback sistemi
- ✅ **Loading States** - Optimistic UI updates
- ✅ **Form Validation** - Real-time Zod validation
- ✅ **Accessibility** - WCAG 2.1 compliant

### ⚡ **Performance & Developer Experience**

- ✅ **State Management** - Redux Toolkit ile type-safe store
- ✅ **Auto Mapping** - AutoMapper ile entity-DTO conversion
- ✅ **Unit Testing** - Vitest ile comprehensive test coverage
- ✅ **Type Safety** - Full TypeScript integration
- ✅ **Hot Reload** - Development için instant feedback

---

## 🛠️ **Teknoloji Stack**

### **🎨 Frontend (TaskFlow.Frontend)**

| Teknoloji           | Versiyon | Kullanım Alanı               |
| ------------------- | -------- | ---------------------------- |
| **React**           | 18.3     | UI Component library         |
| **TypeScript**      | 5.6      | Type-safe JavaScript         |
| **Vite**            | 6.0      | Fast build tool & dev server |
| **Redux Toolkit**   | 2.4      | State management             |
| **React Router**    | 7.0      | Client-side routing          |
| **Tailwind CSS**    | 3.4      | Utility-first CSS framework  |
| **Zod**             | 3.24     | Schema validation            |
| **React Hot Toast** | 2.4      | Notification system          |
| **Vitest**          | 2.1      | Unit testing framework       |
| **Testing Library** | 16.1     | Component testing utilities  |

### **🚀 Backend (TaskFlow.API)**

| Teknoloji                 | Versiyon | Kullanım Alanı            |
| ------------------------- | -------- | ------------------------- |
| **ASP.NET Core**          | 9.0      | Web API framework         |
| **C#**                    | 13.0     | Programming language      |
| **Entity Framework Core** | 9.0      | ORM & database operations |
| **SQLite**                | 3.46     | Development database      |
| **AutoMapper**            | 12.0     | Entity-DTO mapping        |
| **JWT Bearer**            | 9.0      | Authentication middleware |
| **BCrypt.Net**            | 4.0      | Password hashing          |
| **Swagger/OpenAPI**       | 8.1      | API documentation         |

### **🔧 DevOps & Tools**

- **Git** - Version control
- **GitHub** - Repository hosting
- **ESLint & Prettier** - Code formatting
- **Postman** - API testing
- **Docker** - Containerization (Yakında)

---

## 🚀 **Hızlı Başlangıç**

### **📋 Gereksinimler**

- ✅ **.NET 9.0 SDK** - [Download](https://dotnet.microsoft.com/download)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Git** - [Download](https://git-scm.com/)

### **1. 📥 Projeyi İndir**

```bash
git clone https://github.com/alidurna/TaskFlow.git
cd TaskFlow
```

### **📂 İndirilen Dosyalar - Ne İşe Yarar?**

**🎯 HEMEN BAKMANIZ GEREKENLER:**

```
📄 README.md                    ← Bu dosya! Projenin ana rehberi
📄 TaskFlow.sln                 ← Visual Studio solution dosyası
📮 TaskFlow-Postman-Collection.json ← API test senaryoları (Postman'e import edin)
```

**🚀 BACKEND KLASÖRÜ (TaskFlow.API/):**

```
📁 TaskFlow.API/
├── 📄 README.md                ← Backend detaylı dokümantasyonu (MUTLAKA OKUYUN)
├── 📄 Program.cs               ← Uygulama başlangıç noktası
├── 📄 TaskFlow.API.csproj      ← NuGet paketleri ve proje ayarları
├── 📄 appsettings.json         ← Konfigürasyon (JWT, DB connection)
├── 📁 Controllers/             ← API endpoint'leri (Users, Categories, Tasks)
├── 📁 Models/                  ← Database entity'leri (User, Category, TodoTask)
├── 📁 DTOs/                    ← Veri transfer objeleri (API responses)
├── 📁 Services/                ← İş mantığı kodları (UserService, TaskService)
├── 📁 Profiles/                ← AutoMapper mapping kuralları ⭐
├── 📁 Data/                    ← DbContext ve database işlemleri
├── 📁 Middleware/              ← Custom middleware'ler (Auth, Logging)
├── 📁 Migrations/              ← EF Core database migrations
└── 📄 TaskFlow.db              ← SQLite database (ilk çalıştırmada oluşur)
```

**⚛️ FRONTEND KLASÖRÜ (TaskFlow.Frontend/):**

```
📁 TaskFlow.Frontend/
├── 📄 README.md                ← Frontend detaylı dokümantasyonu
├── 📄 package.json             ← npm dependencies ve scripts
├── 📄 vite.config.ts           ← Vite build configuration
├── 📄 tailwind.config.js       ← Tailwind CSS ayarları
├── 📄 tsconfig.json            ← TypeScript konfigürasyonu
├── 📄 vitest.config.ts         ← Test framework ayarları
├── 📁 src/
│   ├── 📄 App.tsx              ← Ana React component
│   ├── 📄 main.tsx             ← React uygulaması entry point
│   ├── 📁 components/          ← UI bileşenleri
│   │   ├── 📁 auth/            ← Login/Register components
│   │   ├── 📁 layout/          ← Header, Sidebar, Layout
│   │   ├── 📁 ui/              ← Button, Card, Input, Toast ⭐
│   │   └── 📁 demo/            ← Toast demo bileşeni
│   ├── 📁 pages/               ← Sayfa bileşenleri (Dashboard, Login, Register)
│   ├── 📁 store/               ← Redux Toolkit store ve slices ⭐
│   │   ├── 📄 index.ts         ← Store configuration
│   │   └── 📁 slices/          ← Auth, Tasks, Categories, UI slices
│   ├── 📁 schemas/             ← Zod validation schemas ⭐
│   ├── 📁 hooks/               ← Custom React hooks (useToast)
│   ├── 📁 services/            ← API çağrı fonksiyonları
│   ├── 📁 test/                ← Test utilities ve setup ⭐
│   └── 📁 contexts/            ← React contexts (AuthContext)
├── 📁 public/                  ← Statik dosyalar (favicon, vite.svg)
└── 📁 node_modules/            ← npm dependencies (git ignore'da)
```

**🧪 TEST KLASÖRÜ (TaskFlow.Tests/):**

```
📁 TaskFlow.Tests/
├── 📄 README.md                ← Test dokümantasyonu
├── 📄 TaskFlow.Tests.csproj    ← Test projesi ayarları
├── 📁 Controllers/             ← API controller testleri
├── 📁 Services/                ← Service katmanı testleri
└── 📁 Helpers/                 ← Test helper'ları
```

**🔧 OLUŞACAK/IGNORE EDİLEN DOSYALAR:**

```
📁 bin/, obj/                   ← Build output dosyaları (.gitignore'da)
📁 node_modules/                ← npm packages (.gitignore'da)
📄 TaskFlow.db                  ← SQLite database (ilk run'da oluşur)
📁 TestResults/                 ← Test çıktıları (.gitignore'da)
```

**🚨 ÖNEMLİ NOTLAR:**

- ⭐ **İşaretli klasörler** yeni eklenen modern özellikler
- 📄 **README.md dosyaları** mutlaka okunmalı
- 📮 **Postman Collection** API'yi test etmek için gerekli
- 🔧 **appsettings.json** JWT ve DB ayarları için kritik

### **2. 🗄️ Backend Kurulumu**

```bash
cd TaskFlow.API

# Dependencies yükle
dotnet restore

# Database oluştur
dotnet ef database update

# Backend'i başlat
dotnet run
```

**✅ Backend: http://localhost:5280**

### **3. ⚛️ Frontend Kurulumu**

```bash
cd ../TaskFlow.Frontend

# Dependencies yükle
npm install

# Frontend'i başlat
npm run dev
```

**✅ Frontend: http://localhost:3000**

### **4. 🧪 Test Kullanıcısı**

```bash
# Register sayfasında yeni hesap oluştur:
Email: test@taskflow.com
Şifre: test123456
```

---

## 📁 **Proje Yapısı**

```
TaskFlow/
├── 📄 README.md                       # Ana proje dokümantasyonu
├── 📄 TaskFlow.sln                    # Visual Studio solution
├── 📮 TaskFlow-Postman-Collection.json # API test collection
│
├── 🚀 TaskFlow.API/                   # ASP.NET Core Backend
│   ├── 🎛️ Controllers/               # API Controllers
│   ├── 📊 Models/                     # Entity models
│   ├── 🔄 Services/                   # Business logic
│   ├── 🗺️ Profiles/                  # AutoMapper profiles
│   ├── 📝 DTOs/                       # Data Transfer Objects
│   ├── 🗄️ Data/                      # DbContext & migrations
│   ├── 🛡️ Middleware/                 # Custom middleware
│   ├── 🔧 Extensions/                 # Extension methods
│   └── 📄 README.md                   # Backend dokümantasyonu
│
├── ⚛️ TaskFlow.Frontend/               # React TypeScript Frontend
│   ├── 🎨 src/
│   │   ├── 🧩 components/             # UI components
│   │   │   ├── 🔐 auth/               # Authentication components
│   │   │   ├── 🏗️ layout/             # Layout components
│   │   │   ├── 🎮 ui/                 # Reusable UI components
│   │   │   └── 🎯 demo/               # Demo components
│   │   ├── 📄 pages/                  # Route pages
│   │   ├── 🗃️ store/                  # Redux store & slices
│   │   ├── 🎣 hooks/                  # Custom React hooks
│   │   ├── 📋 schemas/                # Zod validation schemas
│   │   ├── 🌐 services/               # API services
│   │   ├── 🧪 test/                   # Test utilities
│   │   ├── 🎭 contexts/               # React contexts
│   │   └── 🔧 utils/                  # Utility functions
│   └── 📄 README.md                   # Frontend dokümantasyonu
│
└── 🧪 TaskFlow.Tests/                 # Test projects
    ├── 🎛️ Controllers/                # Controller tests
    ├── 🔄 Services/                   # Service tests
    └── 📄 README.md                   # Test dokümantasyonu
```

---

## 📊 **API Endpoints**

### **🔐 Authentication**

```http
POST   /api/users/register         # Kullanıcı kaydı
POST   /api/users/login            # Kullanıcı girişi
GET    /api/users/profile          # Profil bilgileri
PUT    /api/users/profile          # Profil güncelleme
```

### **📁 Categories**

```http
GET    /api/categories             # Kategori listesi
POST   /api/categories             # Kategori oluştur
PUT    /api/categories/{id}        # Kategori güncelle
DELETE /api/categories/{id}        # Kategori sil
```

### **✅ Tasks**

```http
GET    /api/tasks                  # Görev listesi (filtering, pagination)
POST   /api/tasks                  # Görev oluştur
GET    /api/tasks/{id}             # Görev detayı
PUT    /api/tasks/{id}             # Görev güncelle
DELETE /api/tasks/{id}             # Görev sil
PATCH  /api/tasks/{id}/complete    # Görev tamamla
```

**📚 Detaylı API dokümantasyonu:** http://localhost:5280/swagger

---

## 🧪 **Test Etme**

### **Backend Tests**

```bash
cd TaskFlow.API
dotnet test --verbosity normal
```

### **Frontend Tests**

```bash
cd TaskFlow.Frontend

# Unit tests
npm run test

# Coverage report
npm run test:coverage

# Test UI
npm run test:ui
```

### **API Testing (Postman)**

1. **Import:** `TaskFlow-Postman-Collection.json`
2. **Environment:** Localhost variables set edilecek
3. **Run Collection:** Automated test scenarios

---

## 🎯 **Geliştirme Roadmap**

### **✅ Tamamlanan Özellikler**

- ✅ **Core CRUD Operations** - User, Category, Task management
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Redux State Management** - Type-safe global state
- ✅ **Form Validation** - Zod schema validation
- ✅ **Toast Notifications** - User feedback system
- ✅ **Unit Testing** - Vitest test framework
- ✅ **AutoMapper Implementation** - Entity-DTO mapping

### **🔄 Kısa Vade (2-4 hafta)**

- ⏳ **Caching Layer** - Redis/In-Memory caching
- ⏳ **SignalR Real-time** - Live notifications
- ⏳ **File Upload System** - Avatar ve attachments
- ⏳ **Advanced Search** - Elasticsearch integration

### **📅 Orta Vade (1-2 ay)**

- ⏳ **Dashboard Analytics** - Charts ve reports
- ⏳ **Team Collaboration** - Shared tasks
- ⏳ **Mobile App** - React Native
- ⏳ **PWA Features** - Offline support
- ⏳ **Email Notifications** - SMTP integration

### **🚀 Uzun Vade (3+ ay)**

- ⏳ **Microservices** - Service decomposition
- ⏳ **Kubernetes** - Container orchestration
- ⏳ **Multi-tenant** - SaaS architecture
- ⏳ **AI Integration** - Smart task suggestions

---

## 🤝 **Katkıda Bulunma**

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Contribution Guidelines**

- ✅ Follow existing code style
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Use conventional commit messages

---

## 📞 **İletişim & Destek**

- **👨‍💻 Developer:** [Ali Durna](https://github.com/alidurna)
- **📧 Email:** alidurna@example.com
- **🐛 Issues:** [GitHub Issues](https://github.com/alidurna/TaskFlow/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/alidurna/TaskFlow/discussions)

---

## 📄 **Lisans**

Bu proje **MIT** lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 **Teşekkürler**

- **React Team** - Amazing frontend framework
- **Microsoft** - .NET platform ve tooling
- **Community** - Open source ecosystem

---

**⭐ Bu projeyi beğendiyseniz, lütfen yıldız verin!**
