# ⚛️ TaskFlow Frontend

**Modern React TypeScript Görev Yönetimi Frontend Uygulaması**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-brightgreen.svg)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.4-purple.svg)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-blue.svg)](https://tailwindcss.com/)

---

## 🎯 **Proje Hakkında**

TaskFlow Frontend, **TaskFlow API** ile entegre çalışan modern React TypeScript uygulamasıdır. Redux Toolkit ile state management, Zod ile form validation ve Vitest ile comprehensive test coverage sağlar.

---1

## ✨ **Özellikler**

### ✅ **Tamamlanan**

- **Redux Toolkit State Management** - Type-safe global state
- **Zod Form Validation** - Real-time schema validation
- **Toast Notification System** - User feedback
- **Unit Testing Framework** - Vitest + Testing Library
- **Responsive Design** - Mobile-first approach
- **TypeScript Integration** - Full type safety

### 🎨 **UI Bileşenleri**

- **Authentication Pages** - Login/Register forms
- **Dashboard Layout** - Modern sidebar navigation
- **Reusable UI Components** - Button, Card, Input, Toast
- **Demo Components** - Toast demonstration

---

## 🛠️ **Teknoloji Stack**

| Teknoloji           | Versiyon | Amaç                    |
| ------------------- | -------- | ----------------------- |
| **React**           | 18.3     | Frontend framework      |
| **TypeScript**      | 5.6      | Type safety             |
| **Vite**            | 6.0      | Build tool & dev server |
| **Redux Toolkit**   | 2.4      | State management        |
| **React Router**    | 7.0      | Client-side routing     |
| **Tailwind CSS**    | 3.4      | Styling framework       |
| **Zod**             | 3.24     | Schema validation       |
| **React Hot Toast** | 2.4      | Notifications           |
| **Vitest**          | 2.1      | Unit testing            |
| **Testing Library** | 16.1     | Component testing       |

---

## 🚀 **Hızlı Başlangıç**

### **Gereksinimler**

- Node.js 18+
- npm veya yarn

### **1. Bağımlılıkları Yükle**

```bash
npm install
```

### **2. Geliştirme Sunucusunu Başlat**

```bash
npm run dev
```

### **3. Uygulamaya Erişim**

- **Frontend:** http://localhost:3000
- **Backend Gerekli:** http://localhost:5280 (TaskFlow.API)

---

## 📁 **Proje Yapısı**

```
TaskFlow.Frontend/
├── 📄 README.md              ← Frontend dokümantasyonu
├── 📄 package.json           ← Dependencies ve scripts
├── 📄 vite.config.ts         ← Vite build ayarları
├── 📄 vitest.config.ts       ← Test framework konfigürasyonu
├── 📄 tailwind.config.js     ← Tailwind CSS ayarları
├── 📄 tsconfig.json          ← TypeScript ayarları
├── 📄 eslint.config.js       ← ESLint kod kalitesi
├── 📄 index.html             ← Ana HTML template
└── 📁 src/                   ← Kaynak kod
    ├── 📄 App.tsx           ← Ana React component
    ├── 📄 main.tsx          ← Entry point
    ├── 🧩 components/       ← UI Bileşenleri
    │   ├── 🏗️ layout/       ← Layout components
    │   ├── 🎮 ui/           ← Reusable UI components
    │   └── 🎯 demo/         ← Demo components
    ├── 📄 pages/            ← Sayfa Bileşenleri
    ├── 🗃️ store/           ← Redux Toolkit State Management
    ├── 📋 schemas/          ← Zod Validation Schemas
    ├── 🎣 hooks/            ← Custom React Hooks
    ├── 🌐 services/         ← API Service Functions
    ├── 🧪 test/             ← Test Setup
    ├── 🎭 contexts/         ← React Contexts
    ├── 🎨 assets/           ← Statik Assets
    └── 📝 types/            ← TypeScript Type Definitions
```

---

## 🧪 **Test**

### **Test Çalıştırma**

```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# Test UI
npm run test:ui

# Run tests once
npm run test:run
```

### **Test Sonuçları**

```
✓ 12/12 tests passed
✓ Button component - All scenarios
✓ Test utilities working
✓ Coverage ready
```

---

## 📊 **Kullanılabilir Scripts**

```bash
# Development
npm run dev              # Dev server başlat
npm run build            # Production build
npm run preview          # Production build önizleme

# Testing
npm run test             # Test çalıştır (watch mode)
npm run test:run         # Test çalıştır (once)
npm run test:coverage    # Coverage report
npm run test:ui          # Test UI aç

# Code Quality
npm run lint             # ESLint çalıştır
npm run lint:fix         # ESLint düzelt
```

---

## 🎯 **Geliştirme Yol Haritası**

### **✅ Tamamlanan**

- ✅ **Core Setup** - React + TypeScript + Vite
- ✅ **State Management** - Redux Toolkit
- ✅ **Form Validation** - Zod schemas
- ✅ **UI Framework** - Tailwind CSS
- ✅ **Testing Setup** - Vitest + Testing Library
- ✅ **Toast System** - User feedback

### **🔄 Devam Eden**

- ⏳ **Task Management UI** - CRUD interface
- ⏳ **Dashboard Analytics** - Charts ve istatistikler
- ⏳ **Advanced Search** - Multi-criteria filtering
- ⏳ **Real-time Updates** - SignalR integration

### **📅 Planlanan**

- ⏳ **PWA Features** - Offline support
- ⏳ **Dark Theme** - Theme system
- ⏳ **Mobile Optimization** - Mobile UX
- ⏳ **Accessibility** - WCAG 2.1 compliance

---

## 🔧 **Geliştirme Notları**

### **State Management**

- **Redux Toolkit** - Complex state için
- **React Context** - Theme/auth için
- **Local State** - Component-specific data için

### **Form Handling**

- **Zod schemas** - Validation için
- **React Hook Form** - Planlanan entegrasyon
- **Real-time validation** - Anlık feedback

### **API Integration**

- **Axios** - HTTP requests
- **Redux Toolkit Query** - Planlanan
- **Error handling** - Toast notifications ile

---

## 🤝 **Katkıda Bulunma**

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/new-feature`)
3. Değişiklikleri yapın ve test ekleyin
4. Testleri çalıştırın (`npm run test`)
5. Commit yapın (`git commit -m 'feat: add new feature'`)
6. Branch'i push edin (`git push origin feature/new-feature`)
7. Pull Request açın

---

## 📞 **Destek**

- **Issues:** [GitHub Issues](https://github.com/alidurna/TaskFlow/issues)
- **Documentation:** `src/` klasör README dosyaları
- **API Docs:** http://localhost:5280/swagger

---

**Happy Coding! ⚛️**
