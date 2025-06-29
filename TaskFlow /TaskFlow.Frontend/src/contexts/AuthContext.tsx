/**
 * Authentication Context - TaskFlow Frontend
 *
 * Bu dosya, uygulamanın authentication state'ini global olarak yönetir.
 * React Context API kullanarak tüm component'lere authentication bilgilerini sağlar.
 *
 * Özellikler:
 * - Kullanıcı giriş/çıkış state'i
 * - JWT token yönetimi
 * - Login/Register/Logout işlemleri
 * - Protected route kontrolü
 * - Automatic token validation
 *
 * Kullanım:
 * - App.tsx'de AuthProvider ile sarmalama
 * - Component'lerde useAuth hook ile kullanım
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authAPI, tokenManager } from "../services/api";
import type {
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth.types";

/**
 * Authentication Context
 *
 * Global authentication state'ini tutar.
 * Başlangıçta undefined (henüz context provider ile sarmalanmamış)
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props Interface
 */
interface AuthProviderProps {
  children: ReactNode; // Sarmalanacak component'ler
}

/**
 * Authentication Provider Component
 *
 * Tüm uygulamayı sarar ve authentication state'ini sağlar.
 *
 * Özellikler:
 * - Initial token validation
 * - User state management
 * - Loading state management
 * - Authentication actions (login, register, logout)
 *
 * @param children - Sarmalanacak component'ler
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ===== STATE MANAGEMENT =====

  // Mevcut kullanıcı bilgileri (null = giriş yapılmamış)
  const [user, setUser] = useState<User | null>(null);

  // Loading durumu (initial load, login, register işlemleri için)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Computed property - kullanıcı giriş yapmış mı?
  const isAuthenticated = !!user;

  // ===== AUTHENTICATION ACTIONS =====

  /**
   * Kullanıcı Giriş İşlemi
   *
   * @param credentials - Email ve şifre bilgileri
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);

      // Backend'e login isteği gönder
      const response = await authAPI.login(credentials);

      if (response.success && response.data?.user) {
        // Başarılı giriş - user state'ini güncelle
        setUser(response.data.user);

        console.log("✅ Login successful:", response.data.user.email);
      } else {
        throw new Error(response.message || "Giriş işlemi başarısız");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      // Hata durumunda user state'ini temizle
      setUser(null);
      tokenManager.removeToken();
      throw error; // Component'e hata fırlat
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kullanıcı Kayıt İşlemi
   *
   * @param userData - Kullanıcı kayıt bilgileri
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);

      // Backend'e register isteği gönder
      const response = await authAPI.register(userData);

      if (response.success && response.data?.user) {
        // Başarılı kayıt - user state'ini güncelle
        setUser(response.data.user);

        console.log("✅ Registration successful:", response.data.user.email);
      } else {
        throw new Error(response.message || "Kayıt işlemi başarısız");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      // Hata durumunda user state'ini temizle
      setUser(null);
      tokenManager.removeToken();
      throw error; // Component'e hata fırlat
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kullanıcı Çıkış İşlemi
   */
  const logout = (): void => {
    try {
      // Backend'e logout isteği (opsiyonel - fire and forget)
      authAPI.logout().catch((error) => {
        console.error("Logout API error:", error);
      });

      // Local state'i temizle
      setUser(null);
      tokenManager.removeToken();

      console.log("✅ Logout successful");

      // Login sayfasına yönlendir
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  /**
   * Kullanıcı Profil Güncelleme
   *
   * @param userData - Güncellenecek kullanıcı bilgileri
   */
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);

      // Backend'e update isteği gönder
      const updatedUser = await authAPI.updateProfile(userData);

      // Local state'i güncelle
      setUser(updatedUser);

      console.log("✅ Profile updated successfully");
    } catch (error) {
      console.error("❌ Profile update error:", error);
      throw error; // Component'e hata fırlat
    } finally {
      setIsLoading(false);
    }
  };

  // ===== INITIAL AUTHENTICATION CHECK =====

  /**
   * Sayfa yüklendiğinde token kontrolü
   *
   * Eğer localStorage'da geçerli bir token varsa,
   * kullanıcı bilgilerini backend'den al ve state'e set et.
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);

        // Token var mı ve geçerli mi?
        const token = tokenManager.getToken();

        if (!token || !tokenManager.isTokenValid()) {
          // Token yok veya geçersiz - giriş yapılmamış state
          setUser(null);
          tokenManager.removeToken();
          return;
        }

        // Token geçerli - kullanıcı bilgilerini al
        const userProfile = await authAPI.getProfile();
        setUser(userProfile);

        console.log("✅ Auto-login successful:", userProfile.email);
      } catch (error) {
        console.error("❌ Auto-login failed:", error);
        // Hata durumunda token'ı temizle
        setUser(null);
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // Component mount'ta bir kez çalış

  // ===== CONTEXT VALUE =====

  /**
   * Context'e sağlanacak değerler
   */
  const contextValue: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateUser,
  };

  // ===== RENDER =====

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * useAuth Custom Hook
 *
 * Authentication context'ini kullanmak için custom hook.
 * Component'lerde kolayca authentication state'ine erişim sağlar.
 *
 * @returns AuthContextType - Authentication state ve actions
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <div>Hoş geldin, {user.firstName}!</div>;
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth hook, AuthProvider component içinde kullanılmalıdır. " +
        "App.tsx dosyasında <AuthProvider> ile uygulamayı sarmaladığınızdan emin olun."
    );
  }

  return context;
};

/**
 * Named Export Only - AuthProvider
 */
// export default AuthProvider; // Fast refresh için default export kaldırıldı
