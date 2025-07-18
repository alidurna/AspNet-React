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
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // useAuth eklendi
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ui/Toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PWAInstallBanner from "./components/ui/PWAInstallBanner";
import usePWA from "./hooks/usePWA";
import useSignalR from "./hooks/useSignalR";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Categories from "./pages/Categories";
import Statistics from "./pages/Statistics";
import LoadingSpinner from "./components/ui/LoadingSpinner"; // LoadingSpinner eklendi
import ForgotPassword from "./pages/ForgotPassword"; // Eklendi
import ResetPassword from "./pages/ResetPassword"; // Eklendi
import Security from "./pages/Security"; // Eklendi

/**
 * AuthAppRoutes
 *
 * Kimlik doğrulama durumuna (isLoading ve isAuthenticated) bağlı olarak rotaları işler.
 * Yükleme durumunda bir LoadingSpinner gösterir, aksi takdirde doğru sayfaya yönlendirme yapar.
 *
 * @returns {JSX.Element}
 */
function AuthAppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Kimlik doğrulama durumu yüklenirken bir yükleme spinner'ı göster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Ana sayfa - kullanıcıyı kimlik doğrulama durumuna göre yönlendirir */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Kimlik doğrulama rotaları - kullanıcı zaten giriş yapmışsa dashboard'a yönlendir */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
      />

      {/* Korumalı rotalar - ProtectedRoute bileşeni aracılığıyla kimlik doğrulaması gerektirir */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />

      {/* Tüm diğer bilinmeyen rotalar için - kullanıcıyı kimlik doğrulama durumuna göre yönlendirir */}
      <Route
        path="*"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

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
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <ThemeProvider>
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
            <AuthAppRoutes /> {/* Yeni oluşturulan rota bileşeni kullanılıyor */}

            {/* PWA Install Banner */}
            <PWAInstallBanner />
          </ThemeProvider>
        </AuthProvider>
      </Router>
        </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
