/**
 * Apple Sign-In Login Provider
 * 
 * Apple Sign-In entegrasyonu için özel component.
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface AppleLoginProviderProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Apple Sign-In Login Provider Component
 */
export const AppleLoginProvider: React.FC<AppleLoginProviderProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Apple Sign-In handler
   */
  const handleAppleLogin = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      // Apple Sign-In popup window aç
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
            reject(new Error('Apple girişi iptal edildi'));
          }
        }, 1000);
      });

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple girişi başarısız';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAppleLogin}
      disabled={disabled || isLoading}
      variant="outline"
      className={`w-full flex items-center justify-center gap-3 py-3 bg-black text-white hover:bg-gray-800 border-black ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      )}
      <span>{isLoading ? 'Apple ile giriş yapılıyor...' : 'Apple ile devam et'}</span>
    </Button>
  );
}; 