/**
 * WebAuthn Setup Component - Biyometrik Giriş Kurulumu
 * 
 * Bu component, WebAuthn ile biyometrik giriş kurulum işlemlerini yönetir.
 * Kullanıcının biyometrik kimlik bilgilerini kaydetmesini sağlar.
 */

import React, { useEffect, useState } from 'react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FaFingerprint, FaEye, FaTimes, FaCheck } from 'react-icons/fa';

/**
 * WebAuthn Setup Props
 */
interface WebAuthnSetupProps {
  username: string;
  displayName?: string;
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

/**
 * WebAuthn Setup Component
 * 
 * Biyometrik giriş kurulum işlemlerini yönetir.
 * 
 * @param props Component props
 * @returns JSX Element
 */
const WebAuthnSetup: React.FC<WebAuthnSetupProps> = ({
  username,
  displayName,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const toast = useToast();
  const {
    isSupported,
    isLoading,
    error,
    checkSupport,
    register,
    clearError
  } = useWebAuthn();

  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const [step, setStep] = useState<'checking' | 'setup' | 'success'>('checking');

  // Component mount'ta desteği kontrol et
  useEffect(() => {
    const initWebAuthn = async () => {
      setIsCheckingSupport(true);
      const supported = await checkSupport();
      
      if (!supported) {
        toast.showError('Biyometrik giriş desteklenmiyor');
        onCancel();
        return;
      }
      
      setIsCheckingSupport(false);
      setStep('setup');
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
   * Biyometrik kurulum işlemini başlat
   */
  const handleSetup = async () => {
    try {
      const success = await register(username, displayName);
      
      if (success) {
        setStep('success');
        toast.showSuccess('Biyometrik giriş başarıyla kuruldu!');
        
        // 3 saniye sonra success callback'i çağır
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        toast.showError('Biyometrik kurulum başarısız');
      }
    } catch (err: any) {
      toast.showError(err.message || 'Kurulum işlemi başarısız');
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

  // Başarılı kurulum
  if (step === 'success') {
    return (
      <div className={`flex flex-col items-center justify-center p-6 space-y-6 ${className}`}>
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <FaCheck className="w-10 h-10 text-green-500" />
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Kurulum Tamamlandı!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Biyometrik giriş başarıyla kuruldu. Artık parmak izinizi veya yüz tanımanızı kullanarak giriş yapabilirsiniz.
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Otomatik olarak yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  // Kurulum adımı
  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-6 ${className}`}>
      {/* Biyometrik İkon */}
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
        <FaFingerprint className="w-10 h-10 text-blue-500" />
      </div>

      {/* Başlık */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Biyometrik Giriş Kurulumu
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Güvenli ve hızlı giriş için biyometrik kimlik doğrulama kurun
        </p>
      </div>

      {/* Kurulum Adımları */}
      <div className="w-full space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            Kurulum Adımları:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start">
              <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                1
              </span>
              "Kurulumu Başlat" butonuna tıklayın
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                2
              </span>
              Tarayıcı biyometrik kimlik oluşturma isteği gönderecek
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                3
              </span>
              Parmak izinizi veya yüz tanımanızı kullanarak doğrulama yapın
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                4
              </span>
              Kurulum tamamlandığında bildirim alacaksınız
            </li>
          </ul>
        </div>
      </div>

      {/* Butonlar */}
      <div className="w-full space-y-3">
        <Button
          onClick={handleSetup}
          disabled={isLoading}
          className="w-full h-12 text-lg font-medium"
          variant="default"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Kurulum Yapılıyor...
            </>
          ) : (
            <>
              <FaFingerprint className="w-5 h-5 mr-2" />
              Kurulumu Başlat
            </>
          )}
        </Button>

        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Daha Sonra
        </Button>
      </div>

      {/* Güvenlik Bilgisi */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Biyometrik verileriniz cihazınızda güvenli şekilde saklanır ve hiçbir zaman sunucuya gönderilmez.
        </p>
      </div>
    </div>
  );
};

export default WebAuthnSetup; 