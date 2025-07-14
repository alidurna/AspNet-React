// ****************************************************************************************************
//  APP.TSX
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının ana React component'idir. Tüm global provider'ları, router
//  konfigürasyonunu ve ana sayfa yönlendirmelerini içerir. Uygulamanın kök component'i olarak
//  tüm sayfa ve modüllerin giriş noktasıdır.
//
//  ANA BAŞLIKLAR:
//  - Global Provider Configuration
//  - Routing ve Navigation
//  - PWA ve Offline Support
//  - Authentication Flow
//  - State Management Setup
//  - Error Handling ve Fallbacks
//
//  GÜVENLİK:
//  - Authentication provider setup
//  - Route protection
//  - PWA security
//  - Offline data protection
//  - State isolation
//
//  HATA YÖNETİMİ:
//  - Global error boundaries
//  - Route fallbacks
//  - Offline state handling
//  - PWA update management
//  - Graceful degradation
//
//  EDGE-CASE'LER:
//  - Offline state transitions
//  - PWA update conflicts
//  - Route navigation errors
//  - Provider initialization failures
//  - Browser compatibility issues
//  - Network connectivity changes
//  - Service worker registration failures
//
//  YAN ETKİLER:
//  - Provider setup affects global state
//  - Routing affects user navigation
//  - PWA updates affect user experience
//  - Offline state affects functionality
//  - Authentication affects access control
//
//  PERFORMANS:
//  - Efficient provider initialization
//  - Optimized routing
//  - Lazy loading support
//  - PWA caching strategy
//  - State management optimization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear component structure
//  - Comprehensive documentation
//  - Extensible routing system
//  - Modular provider architecture
//  - Configuration-based flexibility
// ****************************************************************************************************
/**
 * App.tsx
 *
 * Uygulamanın ana componentidir. Tüm global provider'ları, router'ı ve ana sayfa yönlendirmelerini içerir.
 *
 * - Redux Provider ile global state yönetimi
 * - AuthProvider ile kimlik doğrulama context'i
 * - ToastProvider ile bildirim sistemi
 * - React Router ile sayfa yönlendirme ve koruma
 * - PWA ve offline desteği
 *
 * Tüm sayfa ve modüllerin giriş noktasıdır.
 */

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
import useSignalR from "./hooks/useSignalR"; // Eklendi
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Categories from "./pages/Categories";
import Statistics from "./pages/Statistics";

/**
 * App
 *
 * Uygulamanın kök component'i. Tüm provider'ları ve router'ı içerir.
 * Route'lar ve global context'ler burada tanımlanır.
 *
 * @returns {JSX.Element}
 */
function App() {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();
  useSignalR(); // SignalR bağlantısını başlat

  return (
    <Provider store={store}>
      <Router>
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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Profile sayfası - kullanıcı profili */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Görevler sayfası - kullanıcının görevlerini yönetir */}
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } />

            {/* Kategoriler sayfası - kullanıcının kategorilerini yönetir */}
            <Route path="/categories" element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } />

            {/* İstatistikler sayfası - kullanıcının istatistiklerini gösterir */}
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />

            {/* ===== CATCH-ALL ROUTE ===== */}
            {/* 404 durumları ve geçersiz URL'ler için */}
            {/* Kullanıcıyı login sayfasına yönlendirir */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* PWA Install Banner */}
          <PWAInstallBanner />
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
