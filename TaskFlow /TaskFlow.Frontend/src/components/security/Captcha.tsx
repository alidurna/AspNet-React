import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (element: string | HTMLElement, options: any) => number;
      execute: (siteKey: string, options: any) => Promise<string>;
      reset: (widgetId: number) => void;
    };
  }
}

interface CaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  action?: string;
  className?: string;
}

export interface CaptchaRef {
  execute: () => Promise<string>;
}

/**
 * Google ReCAPTCHA v3 Bileşeni
 * 
 * Bu bileşen:
 * - Otomatik olarak ReCAPTCHA script'ini yükler
 * - Kullanıcı etkileşimlerini analiz eder
 * - Bot aktivitelerini tespit eder
 * - Güvenlik skoru üretir
 */
export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({
  siteKey,
  onVerify,
  onError,
  action = 'submit',
  className = ''
}, ref) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    // ReCAPTCHA script'ini yükle
    const loadRecaptchaScript = () => {
      if (window.grecaptcha) {
        return Promise.resolve();
      }

      // Geçersiz site key kontrolü
      if (!siteKey || siteKey === "your-recaptcha-site-key" || siteKey.includes("XXXXX")) {
        console.warn("Captcha devre dışı - geçersiz site key:", siteKey);
        onError?.("Captcha yapılandırılmamış");
        return Promise.reject(new Error("Invalid site key"));
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('ReCAPTCHA script yüklenemedi'));
        
        document.head.appendChild(script);
      });
    };

    // ReCAPTCHA'yı başlat
    const initializeRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        
        window.grecaptcha.ready(() => {
          if (captchaRef.current) {
            // ReCAPTCHA v3 otomatik çalışır, widget render etmeye gerek yok
            console.log('ReCAPTCHA v3 hazır');
          }
        });
      } catch (error) {
        console.error('ReCAPTCHA başlatılamadı:', error);
        onError?.('ReCAPTCHA yüklenemedi');
      }
    };

    initializeRecaptcha();
  }, [siteKey, onError]);

  // ReCAPTCHA token'ı al
  const executeCaptcha = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('ReCAPTCHA yüklenmedi'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action })
          .then((token: string) => {
            console.log('ReCAPTCHA token alındı');
            resolve(token);
          })
          .catch((error: any) => {
            console.error('ReCAPTCHA token alınamadı:', error);
            reject(error);
          });
      });
    });
  };

  // Dışa aktarılan fonksiyon
  useImperativeHandle(ref, () => ({
    execute: executeCaptcha
  }));

  return (
    <div 
      ref={captchaRef}
      className={`captcha-container ${className}`}
      style={{ display: 'none' }} // v3 için görünmez
    />
  );
});

Captcha.displayName = 'Captcha';

/**
 * Captcha Hook'u
 * 
 * ReCAPTCHA işlemlerini yönetmek için kullanılır
 */
export const useCaptcha = (siteKey: string, action: string = 'submit') => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!window.grecaptcha) {
        throw new Error('ReCAPTCHA yüklenmedi');
      }

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action })
            .then((token: string) => {
              console.log('ReCAPTCHA token alındı');
              resolve(token);
            })
            .catch((error: any) => {
              console.error('ReCAPTCHA token alınamadı:', error);
              reject(error);
            });
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ReCAPTCHA hatası';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null)
  };
};

export default Captcha; 