import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { authAPI, tokenManager, profileAPI, type ApiResponse } from "../services/api";
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
} from "../types/auth";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom"; // useNavigate'i import et
import { setOnUnauthorizedCallback } from "../services/api"; // setOnUnauthorizedCallback'i import et

/**
 * @file AuthContext.tsx
 * @description Bu dosya, React Context API kullanarak uygulamanın kimlik doğrulama durumunu global olarak yönetir.
 * Tüm bileşenlere kimlik doğrulama bilgilerini (kullanıcı nesnesi, oturum durumu, yükleme durumu) sağlar.
 * Ayrıca, kullanıcı girişi, kaydı, çıkışı ve profil güncellemeleri gibi kimlik doğrulama ile ilgili işlemleri yönetir.
 *
 * @features
 * - **Kullanıcı Durum Yönetimi**: `user` state'i ile mevcut oturum açmış kullanıcı bilgilerini tutar.
 * - **Yükleme Durumu**: `isLoading` state'i ile kimlik doğrulama işlemlerinin (login, register, initial check) yükleme durumunu gösterir.
 * - **Kimlik Doğrulama İşlemleri**: `login`, `register`, `logout` ve `updateUser` fonksiyonlarını içerir.
 * - **Token Yönetimi**: JWT (JSON Web Token) access ve refresh token'larının `tokenManager` aracılığıyla saklanmasını ve alınmasını sağlar.
 * - **Otomatik Kimlik Doğrulama Kontrolü**: Uygulama yüklendiğinde veya yenilendiğinde, depolanan token'lara göre kullanıcının oturum açma durumunu otomatik olarak kontrol eder.
 * - **Toast Bildirimleri**: `useToast` hook'u ile kullanıcıya başarılı veya hatalı işlemler hakkında bildirimler gösterir.
 * - **Korunmuş Rotalar**: `isAuthenticated` bayrağı ile uygulamadaki korumalı rotalara erişimi kontrol etmek için temel sağlar.
 *
 * @hooks
 * - `useAuth`: `AuthContext`'i tüketen ve kimlik doğrulama durumuna ve fonksiyonlarına kolay erişim sağlayan özel bir hook.
 *
 * @example
 * // App.tsx dosyasında AuthProvider ile sarmalama:
 * <AuthProvider>
 *   <AppRoutes />
 * </AuthProvider>
 *
 * // Herhangi bir bileşende kullanımı:
 * const { user, isAuthenticated, login, logout, isLoading } = useAuth();
 */

/**
 * AuthContextType: Kimlik doğrulama bağlamının sağladığı değerlerin tipini tanımlar.
 * Bu arayüz, kullanıcı nesnesi, kimlik doğrulama durumu, yükleme durumu ve kimlik doğrulama eylemlerini içerir.
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  socialLogin: (provider: "google" | "apple" | "microsoft") => Promise<any>;
}

/**
 * AuthContext: Global kimlik doğrulama durumunu tutar.
 * Başlangıçta `undefined` olarak ayarlanmıştır, bu da context provider ile sarmalanmadığını gösterir.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProviderProps: AuthProvider bileşeninin prop'larını tanımlar.
 * `children` prop'u, context'in kapsayacağı React düğümlerini temsil eder.
 */
interface AuthProviderProps {
  children: ReactNode; // Sarmalanacak React düğümleri
}

/**
 * AuthProvider Bileşeni:
 * Tüm uygulamayı sarar ve kimlik doğrulama durumunu ve ilgili fonksiyonları sağlar.
 *
 * @param children - Bu provider tarafından sarmalanacak alt bileşenler.
 * @returns ReactNode - Kimlik doğrulama bağlamını sağlayan JSX.
 *
 * @details
 * - `user` state'i: Mevcut oturum açmış kullanıcı bilgilerini `User` tipinde tutar. Kullanıcı yoksa `null` olur.
 * - `isLoading` state'i: Kimlik doğrulama işlemlerinin (giriş, kayıt, başlangıç kontrolü) devam edip etmediğini belirtir.
 * - `isAuthenticated` compute property'si: Kullanıcının giriş yapıp yapmadığını gösteren bir boolean değeridir.
 * - `useToast` hook'u: Kullanıcıya geri bildirim sağlamak için toast mesajlarını kullanır.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAuthenticated = !!user;
  const toast = useToast();
  const navigate = useNavigate(); // useNavigate hook'unu tanımla

  /**
   * login:
   * Kullanıcının e-posta ve şifre ile giriş yapmasını sağlar.
   * Backend'e giriş isteği gönderir, başarılı olursa kullanıcı bilgilerini ve refresh token'ı depolar.
   * Hata durumunda uygun toast mesajı gösterir ve kullanıcı durumunu temizler.
   *
   * @param credentials - `LoginRequest` tipinde kullanıcı e-posta ve şifre bilgileri.
   * @returns Promise<void>
   */
  const login = useCallback(async (credentials: LoginRequest, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("🔐 Login attempt with rememberMe:", rememberMe);
      const response: ApiResponse<AuthResponse> = await authAPI.login(credentials);
      
      console.log("📦 Login response:", response);
      
      if (response.success && response.data) {
        // response.data direkt AuthResponse, iç içe data yok
        const authData = response.data;
        
        if (authData.user) {
          setUser(authData.user);
          
          if (authData.token) {
            console.log("💾 Saving token with rememberMe:", rememberMe);
            tokenManager.setToken(authData.token, rememberMe);
            console.log("✅ Token saved. localStorage:", !!localStorage.getItem("taskflow_token"), "sessionStorage:", !!sessionStorage.getItem("taskflow_token"));
          }
          
          if (authData.refreshToken) {
            console.log("💾 Saving refresh token with rememberMe:", rememberMe);
            tokenManager.setRefreshToken(authData.refreshToken, rememberMe);
          }
          
          toast.showSuccess(response.message || `Hoş geldiniz, ${authData.user.email}!`);
        } else {
          throw new Error("Kullanıcı bilgileri alınamadı.");
        }
      } else {
        throw new Error(response.message || "Giriş işlemi başarısız.");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast.showError(error.message || "E-posta veya şifre yanlış.");
      setUser(null);
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * register:
   * Yeni bir kullanıcı kaydı yapar.
   * Backend'e kayıt isteği gönderir, başarılı olursa kullanıcı bilgilerini ve refresh token'ı depolar.
   * Hata durumunda uygun toast mesajı gösterir ve kullanıcı durumunu temizler.
   *
   * @param userData - `RegisterRequest` tipinde kullanıcı kayıt bilgileri.
   * @returns Promise<void>
   */
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response: ApiResponse<AuthResponse> = await authAPI.register(userData);
      if (response.success && response.data) {
        // response.data direkt AuthResponse, iç içe data yok
        const authData = response.data;
        
        if (authData.user) {
          setUser(authData.user);
          
          if (authData.token) {
            tokenManager.setToken(authData.token);
          }
          
          if (authData.refreshToken) {
            tokenManager.setRefreshToken(authData.refreshToken);
          }
          
          toast.showSuccess(response.message || "Kayıt işlemi başarıyla tamamlandı!");
        } else {
          throw new Error("Kullanıcı bilgileri alınamadı.");
        }
      } else {
        throw new Error(response.message || "Kayıt işlemi başarısız oldu.");
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      toast.showError(error.message || "Kayıt olurken bir hata oluştu.");
      setUser(null);
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * logout:
   * Kullanıcının oturumunu kapatır.
   * Backend'e çıkış isteği gönderir (isteğe bağlı), yerel depolama ve kullanıcı durumunu temizler.
   * Başarılı çıkıştan sonra kullanıcıyı `/login` sayfasına yönlendirir.
   *
   * @returns void
   */
  const logout = useCallback((): void => {
    try {
      // Backend'e çıkış isteği gönder (hata olsa bile devam et)
      authAPI.logout().catch((error) => {
        console.error("Logout API error:", error);
        // Backend hatası olsa bile yerel çıkış yapılacak, bu yüzden hata toast'ı gösterme
      });

      // Yerel state'i temizle
      setUser(null);
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      
      // Başarı toast'ı göster
      toast.showSuccess("Başarıyla çıkış yapıldı!");
      
      // Login sayfasına yönlendir
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      toast.showError(error.message || "Çıkış yapılırken beklenmeyen bir hata oluştu.");
    }
  }, [toast, navigate]);

  /**
   * socialLogin:
   * Sosyal medya hesapları ile giriş yapar.
   * OAuth 2.0 flow kullanarak güvenli giriş sağlar.
   *
   * @param provider - Sosyal medya sağlayıcısı ("google", "apple", "microsoft")
   * @returns Promise<any> - Giriş sonucu
   */
  const socialLogin = useCallback(async (provider: "google" | "apple" | "microsoft"): Promise<any> => {
    setIsLoading(true);
    try {
      console.log(`🚀 ${provider} login attempt`);
      
      // OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL}/auth/${provider}`,
        `${provider}_oauth`,
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.");
      }

      // Popup'tan gelen mesajı bekle
      const result = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== import.meta.env.VITE_API_BASE_URL) {
            return;
          }

          if (event.data.type === 'OAUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            resolve(event.data);
          } else if (event.data.type === 'OAUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout kontrolü
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          popup.close();
          reject(new Error("Giriş zaman aşımına uğradı."));
        }, 60000); // 60 saniye
      });

      // Backend'e token gönder ve kullanıcı bilgilerini al
      const response = await authAPI.socialLogin({
        provider,
        token: result.token,
        userData: result.userData
      });

      if (response.success && response.data) {
        // Token'ları kaydet
        tokenManager.setToken(response.data.accessToken);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }

        // Kullanıcı bilgilerini set et
        setUser({
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phoneNumber: response.data.user.phoneNumber || undefined,
          profileImage: response.data.user.profileImage || undefined,
          createdAt: response.data.user.createdAt,
          updatedAt: response.data.user.lastLoginAt || response.data.user.createdAt,
          isEmailVerified: response.data.user.isEmailVerified || true,
        });

        console.log(`✅ ${provider} login successful`);
        return response.data;
      } else {
        throw new Error(response.message || `${provider} ile giriş başarısız oldu.`);
      }
    } catch (error: any) {
      console.error(`❌ ${provider} login error:`, error);
      toast.showError(error.message || `${provider} ile giriş yapılırken bir hata oluştu.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * updateUser:
   * Kullanıcı profil bilgilerini günceller.
   * Backend'e güncelleme isteği gönderir ve başarılı olursa `user` state'ini günceller.
   * Hata durumunda uygun toast mesajı gösterir.
   *
   * @param userData - `Partial<User>` tipinde güncellenecek kullanıcı bilgileri.
   * @returns Promise<void>
   */
  const updateUser = useCallback(async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await profileAPI.updateProfile(userData as any);
      if (response.success && response.data) {
        setUser({
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || undefined,
          profileImage: response.data.profileImage || undefined,
          createdAt: response.data.createdAt,
          updatedAt: response.data.lastLoginAt || response.data.createdAt,
          isEmailVerified: response.data.isEmailVerified || false, // isEmailVerified alanını ekledim ve varsayılan değer verdim
        });
        toast.showSuccess(response.message || "Profil başarıyla güncellendi.");
      } else {
        throw new Error(response.message || "Profil güncellenemedi.");
      }
    } catch (error: any) {
      console.error("❌ Profile update error:", error);
      toast.showError(error.message || "Profil güncellenirken bir hata oluştu.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * useEffect Hook'u - Başlangıç Kimlik Doğrulama Kontrolü:
   * Bileşen yüklendiğinde (mount edildiğinde) bir kez çalışır.
   * Local depolamada geçerli bir access token veya refresh token olup olmadığını kontrol eder.
   * Eğer geçerli bir oturum bulunursa, kullanıcının profil bilgilerini backend'den alır ve `user` state'ini günceller.
   * Geçerli bir token yoksa veya API hatası oluşursa, kullanıcı durumunu temizler ve tüm token'ları kaldırır.
   */
  useEffect(() => {
    // onUnauthorizedCallback'i burada set et
    setOnUnauthorizedCallback(() => {
      // Bu callback tetiklendiğinde logout fonksiyonunu çağır
      // Ancak toast göstermeden sadece state'i temizle
      setUser(null);
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      navigate("/login");
    });

    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        console.log("🔍 Checking auth status on app load...");
        const token = tokenManager.getToken();
        const refreshToken = tokenManager.getRefreshToken();
        
        console.log("📦 Token found (from getToken):", !!token, "Refresh token found (from getRefreshToken):", !!refreshToken);
        console.log("📦 localStorage token raw:", localStorage.getItem("taskflow_token"));
        console.log("📦 sessionStorage token raw:", sessionStorage.getItem("taskflow_token"));

        // Token geçerliliğini kontrol et
        const isAccessTokenValid = tokenManager.isTokenValid();
        console.log("🔍 Access token validity (isTokenValid):", isAccessTokenValid);

        if (!token || (!isAccessTokenValid && !refreshToken)) {
          console.log("❌ No valid token or refresh token found, clearing auth state");
          setUser(null);
          tokenManager.removeToken();
          tokenManager.removeRefreshToken();
          return;
        }

        console.log("✅ Valid token found, attempting to fetch user profile...");
        
        // Kullanıcı bilgisini almak için profileAPI.getProfile kullan
        const response = await profileAPI.getProfile();
        console.log("✅ Profile API response:", response);
        if (response.success && response.data) {
          console.log("✅ Profile fetched successfully for:", response.data.email);
          const fetchedUser: User = {
            id: response.data.id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber || '', // Opsiyonel ise varsayılan değer atanmalı
            profileImage: response.data.profileImage || undefined, // Opsiyonel ise varsayılan değer atanmalı, null yerine undefined
            createdAt: response.data.createdAt,
            updatedAt: response.data.lastLoginAt || response.data.createdAt, // Backend'den gelen son giriş tarihini kullan
            isEmailVerified: response.data.isEmailVerified, // isEmailVerified alanını ekle
          };

          // Sadece kullanıcı değiştiyse (id farklıysa veya henüz kullanıcı atanmamışsa) state'i güncelle
          if (!user || user.id !== fetchedUser.id) {
            console.log("👤 Setting user state:", fetchedUser.email);
            setUser(fetchedUser);
          }
        } else {
          throw new Error(response.message || "Profil bilgileri alınamadı.");
        }
      } catch (error: any) {
        console.error("❌ Initial auth check failed:", error);
        toast.showError(error.message || "Oturum bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        setUser(null);
        tokenManager.removeToken();
        tokenManager.removeRefreshToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [toast, navigate]); // logout bağımlılığını kaldırdım

  /**
   * AuthContext'in sağladığı değer objesi.
   * Bu değerler, `useContext(AuthContext)` veya `useAuth()` hook'u aracılığıyla tüketilir.
   */
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    socialLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook'u:
 * `AuthContext`'i tüketen ve kimlik doğrulama durumuna ve eylemlerine kolay erişim sağlayan özel bir hook'tur.
 * Bu hook, bir bileşen içinden `AuthContext`'e erişmek için kullanılır ve bağlamın `undefined` olmamasını sağlar.
 *
 * @returns `AuthContextType` - Kimlik doğrulama durumu ve eylemleri.
 * @throws Hata - `useAuth` hook'u bir `AuthProvider` içinde kullanılmazsa hata fırlatır.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Alias for backward compatibility
export const useAuthContext = useAuth;