import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { authAPI, tokenManager, profileAPI } from "../services/api";
import type {
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth.types";
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
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }
        toast.showSuccess(response.message || `Hoş geldiniz, ${response.data.user.email}!`);
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
      const response = await authAPI.register(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }
        toast.showSuccess(response.message || "Kayıt işlemi başarıyla tamamlandı!");
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
      authAPI.logout().catch((error) => {
        console.error("Logout API error:", error);
        toast.showError("Çıkış yapılırken bir hata oluştu.");
      });

      setUser(null);
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      toast.showSuccess("Başarıyla çıkış yaptınız.");
      navigate("/login"); // Tam sayfa yenileme yerine navigate kullan
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      toast.showError(error.message || "Çıkış yapılırken beklenmeyen bir hata oluştu.");
    }
  }, [toast, navigate]); // navigate'i bağımlılık dizisine ekle

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
      logout();
    });

    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = tokenManager.getToken();
        const refreshToken = tokenManager.getRefreshToken();

        if (!token || !tokenManager.isTokenValid() && !refreshToken) {
          // Hem access hem de refresh token yoksa veya access token geçersizse ve refresh token da yoksa
          setUser(null);
          tokenManager.removeToken();
          tokenManager.removeRefreshToken();
          return;
        }

        // Eğer access token geçersiz ama refresh token varsa, refresh token ile yeni access token almayı dene
        // Bu kısım artık Axios interceptor'ları tarafından yönetiliyor, doğrudan çağrıya gerek yok.
        // if (!tokenManager.isTokenValid() && refreshToken) {
        //     const refreshResponse = await authAPI.refreshToken();
        //     if (refreshResponse.success && refreshResponse.data?.accessToken && refreshResponse.data?.user) {
        //         tokenManager.setToken(refreshResponse.data.accessToken);
        //         // setUser(refreshResponse.data.user); // Kullanıcı bilgisi değişmemişse tekrar set etmeye gerek yok
        //     } else {
        //         throw new Error(refreshResponse.message || "Token yenileme başarısız.");
        //     }
        // }
        
        // Kullanıcı bilgisini almak için profileAPI.getProfile kullan
        const response = await profileAPI.getProfile();
        if (response.success && response.data) {
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
  }, [toast, logout]); // user bağımlılığını kaldırdım

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
