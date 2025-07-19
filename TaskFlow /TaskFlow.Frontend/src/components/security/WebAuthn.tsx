/**
 * WebAuthn Component - Biyometrik Giriş Yönetimi
 * 
 * Bu component, kullanıcının biyometrik giriş ayarlarını yönetmesini sağlar.
 * WebAuthn kurulumu, durumu ve credential yönetimi işlevlerini içerir.
 */

import React, { useEffect, useState } from 'react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import WebAuthnSetup from '../auth/WebAuthnSetup';
import { FaFingerprint, FaEye, FaTimes, FaTrash, FaPlus } from 'react-icons/fa';
import type { WebAuthnCredential } from '../../types/auth.types';

/**
 * WebAuthn Component
 * 
 * Biyometrik giriş yönetimi için ana component.
 * 
 * @returns JSX Element
 */
export const WebAuthn: React.FC = () => {
  const toast = useToast();
  const {
    isSupported,
    isEnabled,
    isLoading,
    error,
    credentials,
    getStatus,
    deleteCredential,
    clearError
  } = useWebAuthn();

  const [showSetup, setShowSetup] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Component mount'ta durumu getir
  useEffect(() => {
    const initWebAuthn = async () => {
      try {
        await getStatus();
      } catch (err) {
        console.error('WebAuthn durumu alınamadı:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initWebAuthn();
  }, [getStatus]);

  // Hata durumunda toast göster
  useEffect(() => {
    if (error) {
      toast.showError(error);
      clearError();
    }
  }, [error, toast, clearError]);

  /**
   * Credential silme işlemi
   */
  const handleDeleteCredential = async (credentialId: string) => {
    try {
      const success = await deleteCredential(credentialId);
      
      if (success) {
        toast.showSuccess('Biyometrik kimlik başarıyla silindi');
      } else {
        toast.showError('Biyometrik kimlik silinemedi');
      }
    } catch (err: any) {
      toast.showError(err.message || 'Silme işlemi başarısız');
    }
  };

  /**
   * Kurulum başarılı callback'i
   */
  const handleSetupSuccess = () => {
    setShowSetup(false);
    toast.showSuccess('Biyometrik giriş başarıyla kuruldu!');
  };

  /**
   * Kurulum iptal callback'i
   */
  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  // Yükleniyor
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <LoadingSpinner size="md" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Biyometrik giriş ayarları yükleniyor...
        </p>
      </div>
    );
  }

  // Kurulum modu
  if (showSetup) {
    return (
      <WebAuthnSetup
        username="current-user" // Gerçek uygulamada kullanıcı email'i kullanılır
        displayName="Biyometrik Giriş"
        onSuccess={handleSetupSuccess}
        onCancel={handleSetupCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <FaFingerprint className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Biyometrik Giriş
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Face ID, Touch ID veya güvenlik anahtarı ile giriş yapın
          </p>
        </div>
      </div>

      {/* Durum */}
      <div className="space-y-4">
        {/* Destek Durumu */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isSupported ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Tarayıcı Desteği
            </span>
          </div>
          <span className={`text-sm ${
            isSupported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isSupported ? 'Destekleniyor' : 'Desteklenmiyor'}
          </span>
        </div>

        {/* Kurulum Durumu */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isEnabled ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Kurulum Durumu
            </span>
          </div>
          <span className={`text-sm ${
            isEnabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {isEnabled ? 'Kurulu' : 'Kurulmamış'}
          </span>
        </div>
      </div>

      {/* Kurulu Credential'lar */}
      {isEnabled && credentials.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Kurulu Biyometrik Kimlikler
          </h4>
          <div className="space-y-2">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FaFingerprint className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {credential.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Oluşturulma: {new Date(credential.createdAt).toLocaleDateString('tr-TR')}
                      {credential.lastUsedAt && (
                        <span className="ml-2">
                          • Son kullanım: {new Date(credential.lastUsedAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteCredential(credential.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aksiyon Butonları */}
      <div className="space-y-3">
        {!isEnabled ? (
          <Button
            onClick={() => setShowSetup(true)}
            disabled={!isSupported || isLoading}
            className="w-full"
            variant="default"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Yükleniyor...
              </>
            ) : (
              <>
                <FaPlus className="w-4 h-4 mr-2" />
                Biyometrik Giriş Kur
              </>
            )}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowSetup(true)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Yeni Ekle
            </Button>
            <Button
              onClick={() => {
                // Tüm credential'ları sil
                credentials.forEach(cred => handleDeleteCredential(cred.id));
              }}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <FaTrash className="w-4 h-4 mr-2" />
              Tümünü Sil
            </Button>
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Biyometrik Giriş Hakkında
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Parmak izi, yüz tanıma veya güvenlik anahtarı kullanabilirsiniz</li>
          <li>• Biyometrik verileriniz cihazınızda güvenli şekilde saklanır</li>
          <li>• Veriler hiçbir zaman sunucuya gönderilmez</li>
          <li>• Şifre hatırlamaya gerek kalmaz</li>
        </ul>
      </div>
    </div>
  );
}; 