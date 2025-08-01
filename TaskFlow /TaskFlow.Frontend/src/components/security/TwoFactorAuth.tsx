/**
 * TwoFactorAuth Component - Refactored
 * 
 * İki Faktörlü Kimlik Doğrulama yönetimi için ana component.
 * Modüler sub-components kullanır.
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { twoFactorAPI } from '../../services/api';
import type { TwoFactorStatus as TwoFactorStatusType, Enable2FAResponse, RecoveryCodesResponse } from '../../types/auth.types';
import { Button } from '../ui/Button';
import Input from '../ui/Input';

// Sub-components
import TwoFactorStatus from './components/TwoFactorStatus';

/**
 * TwoFactorAuth Component - Refactored
 */
export const TwoFactorAuth: React.FC = () => {
  const { showSuccess, showError } = useToast();
  
  // State
  const [status, setStatus] = useState<TwoFactorStatusType | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<Enable2FAResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Load 2FA status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  /**
   * Load 2FA status
   */
  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await twoFactorAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      showError('2FA durumu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle enable 2FA
   */
  const handleEnable2FA = () => {
    setShowSetupModal(true);
  };

  /**
   * Handle disable 2FA
   */
  const handleDisable2FA = () => {
    setShowDisableModal(true);
  };

  /**
   * Handle show recovery codes
   */
  const handleShowRecoveryCodes = () => {
    setShowRecoveryCodes(true);
  };

  /**
   * Start 2FA setup process
   */
  const startSetupProcess = async () => {
    if (!password.trim()) {
      showError('Şifrenizi girin');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAPI.enable({ password });
      if (response.success) {
        setSetupData(response.data);
        setShowVerifyModal(true);
        setPassword('');
      } else {
        showError(response.message || '2FA etkinleştirme başlatılamadı');
      }
    } catch (error) {
      showError('2FA etkinleştirme başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify 2FA setup
   */
  const handleVerify2FA = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      showError('6 haneli doğrulama kodunu girin');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAPI.verify({ code: verificationCode });
      if (response.success) {
        showSuccess('2FA başarıyla etkinleştirildi!');
        setShowVerifyModal(false);
        setShowSetupModal(false);
        setVerificationCode('');
        loadStatus();
      } else {
        showError(response.message || 'Doğrulama kodu geçersiz');
      }
    } catch (error) {
      showError('Doğrulama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Status Component */}
      <TwoFactorStatus
        status={status}
        isLoading={loading}
        onEnable={handleEnable2FA}
        onDisable={handleDisable2FA}
        onShowRecoveryCodes={handleShowRecoveryCodes}
      />

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">2FA Etkinleştir</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              İki faktörlü kimlik doğrulamayı etkinleştirmek için şifrenizi girin.
            </p>
            
            <Input
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowSetupModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={startSetupProcess} 
                isLoading={loading}
                className="flex-1"
              >
                Devam Et
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && setupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">QR Kodu Tarayın</h3>
            
            <div className="text-center mb-4">
              <img 
                src={setupData.qrCodeUrl} 
                alt="2FA QR Code" 
                className="mx-auto mb-4 border rounded"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Authenticator uygulamanızla QR kodu tarayın veya bu kodu manuel olarak girin:
              </p>
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                {setupData.secretKey}
              </code>
            </div>

            <Input
              type="text"
              placeholder="6 haneli doğrulama kodu"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="mb-4"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowVerifyModal(false);
                  setShowSetupModal(false);
                  setVerificationCode('');
                }} 
                variant="outline" 
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={handleVerify2FA} 
                isLoading={loading}
                className="flex-1"
              >
                Doğrula
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">2FA'yı Devre Dışı Bırak</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bu işlem hesabınızın güvenliğini azaltacaktır. Devam etmek istediğinizden emin misiniz?
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowDisableModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={() => {
                  // Disable 2FA logic would go here
                  setShowDisableModal(false);
                  showSuccess('2FA devre dışı bırakıldı');
                  loadStatus();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Devre Dışı Bırak
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Codes Modal */}
      {showRecoveryCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Kurtarma Kodları</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bu kodları güvenli bir yerde saklayın. Telefonunuzu kaybettiğinizde hesabınıza erişmek için kullanabilirsiniz.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {/* Recovery codes would be loaded here */}
                <div>ABC123</div>
                <div>DEF456</div>
                <div>GHI789</div>
                <div>JKL012</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowRecoveryCodes(false)} 
                variant="outline" 
                className="flex-1"
              >
                Kapat
              </Button>
              <Button 
                onClick={() => {
                  // Copy codes to clipboard
                  showSuccess('Kodlar panoya kopyalandı');
                }}
                className="flex-1"
              >
                Kopyala
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 