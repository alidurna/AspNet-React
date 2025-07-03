import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import PWAInstallBanner from "./components/ui/PWAInstallBanner";
import usePWA from "./hooks/usePWA";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

/**
 * TaskFlow Ana Uygulama Component'i
 *
 * Bu component, tüm uygulamanın kök component'idir ve routing yapılandırmasını içerir.
 * React Router kullanarak sayfa navigasyonunu yönetir.
 *
 * Provider Hierarchy:
 * - Redux Provider: Global state management
 * - AuthProvider: Authentication context
 * - ToastProvider: Notification system
 * - Router: Page navigation
 *
 * Mevcut Route'lar:
 * - "/" : Ana sayfa - Login'e yönlendirir
 * - "/login" : Kullanıcı giriş sayfası
 * - "/register" : Yeni kullanıcı kayıt sayfası
 * - "/dashboard" : Ana kontrol paneli
 * - "*" : Catch-all route - 404 durumları için Login'e yönlendirir
 *
 * Gelecekte Eklenecek Route'lar:
 * - "/tasks" : Görev yönetimi sayfası
 * - "/categories" : Kategori yönetimi sayfası
 * - "/profile" : Kullanıcı profil sayfası
 * - "/settings" : Uygulama ayarları
 *
 * Authentication Logic:
 * Şu anda tüm route'lar herkese açık. İleride:
 * - Public routes: /login, /register
 * - Protected routes: /dashboard, /tasks, /categories, /profile, /settings
 * - Authentication context ile route protection yapılacak
 */
function App() {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();

  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider />

        {/* PWA Update Banner */}
        {updateAvailable && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-2 text-center">
            <span className="mr-4">Yeni sürüm mevcut!</span>
            <button
              onClick={updateServiceWorker}
              className="bg-white text-blue-600 px-3 py-1 rounded font-medium"
            >
              Güncelle
            </button>
          </div>
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-white p-2 text-center">
            <span>🔴 Offline - İnternet bağlantınızı kontrol edin</span>
          </div>
        )}

        <Router>
          {/* ===== MAIN ROUTING CONFIGURATION ===== */}
          <Routes>
            {/* ===== HOME ROUTE ===== */}
            {/* Ana sayfa - kullanıcıyı login sayfasına yönlendirir */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ===== AUTHENTICATION ROUTES ===== */}
            {/* Login sayfası - kullanıcı girişi için */}
            <Route path="/login" element={<Login />} />

            {/* Register sayfası - yeni kullanıcı kaydı için */}
            <Route path="/register" element={<Register />} />

            {/* Dashboard sayfası - ana kontrol paneli */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ===== CATCH-ALL ROUTE ===== */}
            {/* 404 durumları ve geçersiz URL'ler için */}
            {/* Kullanıcıyı login sayfasına yönlendirir */}
            <Route path="*" element={<Navigate to="/login" replace />} />

            {/* 
          ===== FUTURE PROTECTED ROUTES =====
          İleride authentication context implementasyonu sonrası eklenecek:
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          */}
          </Routes>
        </Router>

        {/* PWA Install Banner */}
        <PWAInstallBanner />
      </AuthProvider>
    </Provider>
  );
}

export default App;
