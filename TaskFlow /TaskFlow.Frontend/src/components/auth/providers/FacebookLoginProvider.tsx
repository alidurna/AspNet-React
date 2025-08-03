/**
 * Facebook Login Provider
 * 
 * Facebook OAuth entegrasyonu için özel component.
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface FacebookLoginProviderProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Facebook Login Provider Component
 */
export const FacebookLoginProvider: React.FC<FacebookLoginProviderProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Facebook OAuth handler
   */
  const handleFacebookLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      // Facebook OAuth popup window aç
      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5282/api'}/oauth/facebook`,
        'facebook_oauth',
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
            reject(new Error('Facebook girişi iptal edildi'));
          }
        }, 1000);
      });

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Facebook girişi başarısız';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFacebookLogin}
      disabled={disabled || isLoading}
      variant="outline"
      className={`w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      <span>{isLoading ? 'Facebook ile giriş yapılıyor...' : 'Facebook ile devam et'}</span>
    </Button>
  );
}; 