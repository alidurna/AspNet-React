/**
 * WebAuthn Login Component - Biyometrik Giriş
 * 
 * Bu component, WebAuthn ile biyometrik giriş işlemlerini yönetir.
 * Fingerprint, Face ID, Touch ID gibi biyometrik yöntemleri destekler.
 */

import React, { useEffect, useState } from 'react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FaFingerprint, FaEye, FaTimes } from 'react-icons/fa';

/**
 * WebAuthn Login Props
 */
interface WebAuthnLoginProps {
  username: string;
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * WebAuthn Login Component
 * 
 * Biyometrik giriş işlemlerini yönetir.
 * 
 * @param props Component props
 * @returns JSX Element
 */
const WebAuthnLogin: React.FC<WebAuthnLoginProps> = ({
  username,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const toast = useToast();
  const {
    isSupported,
    isEnabled,
    isLoading,
    error,
    checkSupport,
    authenticate,
    clearError
  } = useWebAuthn();

  const [isCheckingSupport, setIsCheckingSupport] = useState(true);

  // Component mount'ta desteği kontrol et
  useEffect(() => {
    const initWebAuthn = async () => {
      setIsCheckingSupport(true);
      const supported = await checkSupport();
      
      if (!supported) {
        toast.showError('Biyometrik giriş desteklenmiyor');
        onCancel();
      }
      
      setIsCheckingSupport(false);
    };

    initWebAuthn();
  }, [checkSupport, toast, onCancel]);

  // Hata durumunda toast göster
  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearError();
    }
  }, [error, toast, clearError]);

  /**
   * Biyometrik giriş işlemini başlat
   */
  const handleBiometricLogin = async () => {
    try {
      const success = await authenticate(username);
      
      if (success) {
        toast.showSuccess('Biyometrik giriş başarılı!');
        onSuccess();
      } else {
        toast.showError('Biyometrik giriş başarısız');
      }
    } catch (err: any) {
      toast.showError(err.message || 'Giriş işlemi başarısız');
    }
  };

  // Desteği kontrol ediyor
  if (isCheckingSupport) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
        <LoadingSpinner size="md" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Biyometrik giriş kontrol ediliyor...
        </p>
      </div>
    );
  }

  // Desteklenmiyor
  if (!isSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <FaTimes className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Biyometrik Giriş Desteklenmiyor
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Tarayıcınız veya cihazınız biyometrik giriş desteklemiyor.
          </p>
          <Button onClick={onCancel} variant="outline" size="sm">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Kurulmamış
  if (!isEnabled) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}>
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <FaEye className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Biyometrik Giriş Kurulmamış
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Bu hesap için biyometrik giriş henüz kurulmamış.
          </p>
          <Button onClick={onCancel} variant="outline" size="sm">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-6 ${className}`}>
      {/* Biyometrik İkon */}
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
        <FaFingerprint className="w-10 h-10 text-blue-500" />
      </div>

      {/* Başlık */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Biyometrik Giriş
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Parmak izinizi veya yüz tanımanızı kullanarak giriş yapın
        </p>
      </div>

      {/* Giriş Butonu */}
      <div className="w-full space-y-3">
        <Button
          onClick={handleBiometricLogin}
          disabled={isLoading}
          className="w-full h-12 text-lg font-medium"
          variant="default"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Doğrulanıyor...
            </>
          ) : (
            <>
              <FaFingerprint className="w-5 h-5 mr-2" />
              Biyometrik Giriş Yap
            </>
          )}
        </Button>

        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Farklı Yöntemle Giriş
        </Button>
      </div>

      {/* Bilgi */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Güvenli ve hızlı giriş için biyometrik kimlik doğrulama kullanılıyor
        </p>
      </div>
    </div>
  );
};

export default WebAuthnLogin; 