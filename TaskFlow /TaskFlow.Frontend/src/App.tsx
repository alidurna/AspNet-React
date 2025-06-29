import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

/**
 * TaskFlow Ana Uygulama Component'i
 *
 * Bu component, tüm uygulamanın kök component'idir ve routing yapılandırmasını içerir.
 * React Router kullanarak sayfa navigasyonunu yönetir.
 *
 * Mevcut Route'lar:
 * - "/" : Ana sayfa - Login'e yönlendirir
 * - "/login" : Kullanıcı giriş sayfası
 * - "/register" : Yeni kullanıcı kayıt sayfası
 * - "*" : Catch-all route - 404 durumları için Login'e yönlendirir
 *
 * Gelecekte Eklenecek Route'lar:
 * - "/dashboard" : Ana kontrol paneli
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
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
