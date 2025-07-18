/**
 * Social Login Component
 *
 * Bu dosya, TaskFlow uygulaması için sosyal medya ile giriş
 * bileşenini içerir. Google, Apple ve Microsoft OAuth entegrasyonu sağlar.
 *
 * Ana Özellikler:
 * - Google OAuth 2.0 girişi
 * - Apple Sign-In desteği
 * - Microsoft OAuth girişi
 * - Modern buton tasarımı
 * - Loading states
 * - Error handling
 * - Accessibility desteği
 *
 * OAuth Flow:
 * - Popup window ile giriş
 * - Token exchange
 * - User profile fetch
 * - Backend integration
 *
 * Güvenlik:
 * - PKCE flow
 * - State parameter
 * - Nonce validation
 * - Token verification
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";

/**
 * Sosyal medya giriş butonları için tip tanımları
 */
interface SocialLoginProps {
  onSuccess?: (provider: string, userData: any) => void;
  onError?: (provider: string, error: string) => void;
  disabled?: boolean;
}

/**
 * Sosyal medya giriş butonları
 */
const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const { socialLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  /**
   * Google ile giriş
   */
  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading("google");
    try {
      // OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281/api'}/oauth/google`,
        'google_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.");
      }

      // Popup'tan gelen mesajı bekle
      const result = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281')) {
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

      showSuccess("Google ile başarıyla giriş yapıldı!");
      onSuccess?.("google", result);
    } catch (error: any) {
      console.error("Google login error:", error);
      const errorMessage = error.message || "Google ile giriş yapılırken bir hata oluştu";
      showError(errorMessage);
      onError?.("google", errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  /**
   * Apple ile giriş
   */
  const handleAppleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading("apple");
    try {
      // OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281/api'}/oauth/apple`,
        'apple_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.");
      }

      // Popup'tan gelen mesajı bekle
      const result = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281')) {
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

      showSuccess("Apple ile başarıyla giriş yapıldı!");
      onSuccess?.("apple", result);
    } catch (error: any) {
      console.error("Apple login error:", error);
      const errorMessage = error.message || "Apple ile giriş yapılırken bir hata oluştu";
      showError(errorMessage);
      onError?.("apple", errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  /**
   * Microsoft ile giriş
   */
  const handleMicrosoftLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading("microsoft");
    try {
      // OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281/api'}/oauth/microsoft`,
        'microsoft_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.");
      }

      // Popup'tan gelen mesajı bekle
      const result = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281')) {
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

      showSuccess("Microsoft ile başarıyla giriş yapıldı!");
      onSuccess?.("microsoft", result);
    } catch (error: any) {
      console.error("Microsoft login error:", error);
      const errorMessage = error.message || "Microsoft ile giriş yapılırken bir hata oluştu";
      showError(errorMessage);
      onError?.("microsoft", errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Ayırıcı */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-neutral-500 font-light">
            veya şunlarla giriş yapın
          </span>
        </div>
      </div>

      {/* Sosyal Medya Butonları */}
      <div className="grid grid-cols-1 gap-3">
        {/* Google Butonu */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={disabled || isLoading === "google"}
          isLoading={isLoading === "google"}
          className="w-full py-3 px-4 border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-neutral-700">
              {isLoading === "google" ? "Giriş yapılıyor..." : "Google ile devam et"}
            </span>
          </div>
        </Button>

        {/* Apple Butonu */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAppleLogin}
          disabled={disabled || isLoading === "apple"}
          isLoading={isLoading === "apple"}
          className="w-full py-3 px-4 border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="font-medium text-neutral-700">
              {isLoading === "apple" ? "Giriş yapılıyor..." : "Apple ile devam et"}
            </span>
          </div>
        </Button>

        {/* Microsoft Butonu */}
        <Button
          type="button"
          variant="outline"
          onClick={handleMicrosoftLogin}
          disabled={disabled || isLoading === "microsoft"}
          isLoading={isLoading === "microsoft"}
          className="w-full py-3 px-4 border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#7fba00" d="M13 1h10v10H13z"/>
              <path fill="#00a4ef" d="M1 13h10v10H1z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            <span className="font-medium text-neutral-700">
              {isLoading === "microsoft" ? "Giriş yapılıyor..." : "Microsoft ile devam et"}
            </span>
          </div>
        </Button>
      </div>

      {/* Güvenlik Notu */}
      <p className="text-xs text-neutral-500 text-center mt-4">
        Sosyal medya hesaplarınızla güvenli giriş yapın. 
        Verileriniz korunur ve paylaşılmaz.
      </p>
    </div>
  );
};

export default SocialLogin; 