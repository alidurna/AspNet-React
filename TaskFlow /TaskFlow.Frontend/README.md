# ⚛️ TaskFlow Frontend

**Modern React TypeScript Görev Yönetimi Frontend Uygulaması**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-brightgreen.svg)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.4-purple.svg)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-blue.svg)](https://tailwindcss.com/)

---

## 🎯 **Proje Hakkında**

Bu, **TaskFlow API** ile entegre çalışan modern React TypeScript frontend uygulamasıdır. Redux Toolkit ile state management, Zod ile form validation ve Vitest ile comprehensive test coverage sağlar.

---

## ✨ **Implemented Features**

### ✅ **Tamamlanan Özellikler**

- ✅ **Redux Toolkit State Management** - Type-safe global state
- ✅ **Zod Form Validation** - Real-time schema validation
- ✅ **Toast Notification System** - User feedback
- ✅ **Unit Testing Framework** - Vitest + Testing Library
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **TypeScript Integration** - Full type safety

### 🎨 **UI Components**

- ✅ **Authentication Pages** - Login/Register forms
- ✅ **Dashboard Layout** - Modern sidebar navigation
- ✅ **Reusable UI Components** - Button, Card, Input, Toast
- ✅ **Demo Components** - Toast demonstration

---

## 🛠️ **Tech Stack**

| Technology          | Version | Purpose                 |
| ------------------- | ------- | ----------------------- |
| **React**           | 18.3    | Frontend framework      |
| **TypeScript**      | 5.6     | Type safety             |
| **Vite**            | 6.0     | Build tool & dev server |
| **Redux Toolkit**   | 2.4     | State management        |
| **React Router**    | 7.0     | Client-side routing     |
| **Tailwind CSS**    | 3.4     | Styling framework       |
| **Zod**             | 3.24    | Schema validation       |
| **React Hot Toast** | 2.4     | Notifications           |
| **Vitest**          | 2.1     | Unit testing            |
| **Testing Library** | 16.1    | Component testing       |

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- npm or yarn

### **1. Install Dependencies**

```bash
npm install
```

### **2. Start Development Server**

```bash
npm run dev
```

### **3. Access Application**

- **Frontend:** http://localhost:3000
- **Backend Required:** http://localhost:5280 (TaskFlow.API)

---

## 📁 **Project Structure & File Descriptions**

### **📂 Ana Klasör İçeriği**

```
TaskFlow.Frontend/
├── 📄 README.md              ← Bu dosya! Frontend dokümantasyonu
├── 📄 package.json           ← npm dependencies ve scripts (MUTLAKA OKUYUN)
├── 📄 package-lock.json      ← Dependency lock dosyası
├── 📄 vite.config.ts         ← Vite build ve dev server ayarları
├── 📄 vitest.config.ts       ← Test framework konfigürasyonu ⭐
├── 📄 tailwind.config.js     ← Tailwind CSS custom ayarları
├── 📄 tsconfig.json          ← TypeScript compiler ayarları
├── 📄 tsconfig.app.json      ← App-specific TypeScript ayarları
├── 📄 tsconfig.node.json     ← Node.js TypeScript ayarları
├── 📄 eslint.config.js       ← ESLint kod kalitesi ayarları
├── 📄 postcss.config.js      ← PostCSS processor ayarları
├── 📄 index.html             ← Ana HTML template
└── 📁 src/                   ← Kaynak kod ana klasörü
```

### **🎨 src/ Klasör Detayları**

```
src/
├── 📄 App.tsx               ← Ana React component (Routes, Providers)
├── 📄 main.tsx              ← React uygulaması entry point
├── 📄 App.css               ← Global CSS styles
├── 📄 index.css             ← Tailwind CSS imports
├── 📄 vite-env.d.ts         ← Vite TypeScript type definitions
│
├── 🧩 components/           ← UI Bileşenleri
│   ├── 🔐 auth/             ← Authentication components
│   ├── 🏗️ layout/           ← Layout components (Header, Sidebar)
│   ├── 🎮 ui/               ← Reusable UI components ⭐
│   │   ├── Button.tsx       ← Çok kullanımlı button component
│   │   ├── Button.test.tsx  ← Button unit testleri ⭐
│   │   ├── Card.tsx         ← Card container component
│   │   ├── Input.tsx        ← Form input component
│   │   ├── StatsCard.tsx    ← Dashboard istatistik kartları
│   │   └── Toast.tsx        ← Toast notification component ⭐
│   └── 🎯 demo/             ← Demo/örnek bileşenler
│       └── ToastDemo.tsx    ← Toast sistemi demo component ⭐
│
├── 📄 pages/                ← Sayfa Bileşenleri (Route Components)
│   ├── Dashboard.tsx        ← Ana dashboard sayfası
│   ├── Login.tsx           ← Giriş sayfası
│   └── Register.tsx        ← Kayıt sayfası
│
├── 🗃️ store/               ← Redux Toolkit State Management ⭐
│   ├── index.ts            ← Store configuration ve exports
│   └── slices/             ← Redux slices (modüler state)
│       ├── authSlice.ts    ← Authentication state
│       ├── tasksSlice.ts   ← Tasks state management
│       ├── categoriesSlice.ts ← Categories state
│       └── uiSlice.ts      ← UI state (toasts, modals, theme)
│
├── 📋 schemas/             ← Zod Validation Schemas ⭐
│   ├── authSchemas.ts      ← Login, register, profile schemas
│   └── taskSchemas.ts      ← Task creation, update schemas
│
├── 🎣 hooks/               ← Custom React Hooks ⭐
│   └── useToast.ts         ← Toast notification hook
│
├── 🌐 services/           ← API Service Functions
│   └── api.ts              ← HTTP client ve API calls
│
├── 🧪 test/               ← Test Setup ve Utilities ⭐
│   ├── setup.ts           ← Test environment setup
│   └── test-utils.tsx     ← Testing utilities ve mocks
│
├── 🎭 contexts/           ← React Contexts
│   └── AuthContext.tsx    ← Authentication context
│
├── 🎨 assets/             ← Statik Assets
│   └── react.svg          ← React logo
│
├── 🔧 utils/              ← Utility Functions
└── 📝 types/              ← TypeScript Type Definitions
    └── auth.types.ts      ← Authentication type definitions
```

### **📁 public/ Klasörü**

```
public/
└── vite.svg               ← Vite logo (favicon olarak kullanılıyor)
```

**🚨 ÖNEMLİ DOSYALAR:**

- ⭐ **Yeni eklenen özellikler** (Redux, Zod, Tests, Toast)
- 📄 **package.json** - Dependencies ve scripts
- 📄 **vite.config.ts** - Build configuration
- 📄 **vitest.config.ts** - Test configuration
- 🗃️ **store/** - Redux Toolkit state management
- 📋 **schemas/** - Form validation schemas
- 🧪 **test/** - Test utilities ve setup

---

## 🧪 **Testing**

### **Run Tests**

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

### **Test Results**

```
✓ 12/12 tests passed
✓ Button component - All scenarios
✓ Test utilities working
✓ Coverage ready
```

---

## 🎯 **Development Roadmap**

### **✅ Completed**

- ✅ **Core Setup** - React + TypeScript + Vite
- ✅ **State Management** - Redux Toolkit implementation
- ✅ **Form Validation** - Zod schemas & real-time validation
- ✅ **UI Framework** - Tailwind CSS styling
- ✅ **Testing Setup** - Vitest + Testing Library
- ✅ **Toast System** - User feedback notifications

### **🔄 In Progress**

- ⏳ **Task Management UI** - Complete CRUD interface
- ⏳ **Dashboard Analytics** - Charts and statistics
- ⏳ **Advanced Search** - Multi-criteria filtering
- ⏳ **Real-time Updates** - SignalR integration

### **📅 Planned**

- ⏳ **PWA Features** - Offline support
- ⏳ **Dark Theme** - Complete theme system
- ⏳ **Mobile Optimization** - Enhanced mobile UX
- ⏳ **Accessibility** - WCAG 2.1 compliance

---

## 📊 **Available Scripts**

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Open test UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

---

## 🔧 **Development Notes**

### **State Management**

- **Redux Toolkit** for complex state
- **React Context** for theme/auth
- **Local State** for component-specific data

### **Form Handling**

- **Zod schemas** for validation
- **React Hook Form** integration planned
- **Real-time validation** feedback

### **API Integration**

- **Axios** for HTTP requests
- **Redux Toolkit Query** planned
- **Error handling** with toast notifications

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Make changes and add tests
4. Run tests (`npm run test`)
5. Commit changes (`git commit -m 'feat: add new feature'`)
6. Push branch (`git push origin feature/new-feature`)
7. Open Pull Request

---

## 📞 **Support**

- **Issues:** [GitHub Issues](https://github.com/alidurna/TaskFlow/issues)
- **Documentation:** Check `src/` folder README files
- **API Docs:** http://localhost:5280/swagger

---

**Happy Coding! ⚛️**
