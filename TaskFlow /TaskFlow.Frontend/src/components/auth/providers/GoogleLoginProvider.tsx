/**
 * Google OAuth Login Provider
 * 
 * Google OAuth 2.0 entegrasyonu için özel component.
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface GoogleLoginProviderProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Google OAuth Login Provider Component
 */
export const GoogleLoginProvider: React.FC<GoogleLoginProviderProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Google OAuth popup handler
   */
  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      // OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5282/api'}/oauth/google`,
        'google_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.");
      }

      // Popup'tan gelen mesajı bekle
      const result = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'OAUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            resolve(event.data.user);
          } else if (event.data.type === 'OAUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', handleMessage);

        // Popup kapatılma kontrolü
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Giriş işlemi iptal edildi'));
          }
        }, 1000);
      });

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google girişi başarısız';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      variant="outline"
      className={`w-full flex items-center justify-center gap-3 py-3 ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span>{isLoading ? 'Google ile giriş yapılıyor...' : 'Google ile devam et'}</span>
    </Button>
  );
}; 