import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { twoFactorAPI } from '../../services/api';
import type { TwoFactorStatus, Enable2FAResponse, RecoveryCodesResponse } from '../../types/auth.types';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

/**
 * İki Faktörlü Kimlik Doğrulama (2FA) Bileşeni
 * 
 * Bu bileşen kullanıcıların:
 * - 2FA'yı etkinleştirmesini
 * - QR kod ile uygulama bağlamasını
 * - Doğrulama kodlarını girmesini
 * - Kurtarma kodlarını yönetmesini
 * - 2FA'yı devre dışı bırakmasını sağlar
 */
export const TwoFactorAuth: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<Enable2FAResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // 2FA durumunu yükle
  useEffect(() => {
    loadStatus();
  }, []);

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

  // 2FA etkinleştirme başlat
  const handleEnable2FA = async () => {
    if (!password.trim()) {
      showError('Şifrenizi girin');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAPI.enable({ password });
      if (response.success) {
        setSetupData(response.data);
        setShowSetupModal(true);
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

  // 2FA doğrulama
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
        setVerificationCode('');
        setSetupData(null);
        await loadStatus();
      } else {
        showError(response.message || 'Doğrulama kodu hatalı');
      }
    } catch (error) {
      showError('Doğrulama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // 2FA devre dışı bırakma
  const handleDisable2FA = async () => {
    if (!password.trim() || !verificationCode.trim()) {
      showError('Şifre ve doğrulama kodunu girin');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAPI.disable({ 
        password, 
        code: verificationCode 
      });
      if (response.success) {
        showSuccess('2FA başarıyla devre dışı bırakıldı');
        setShowDisableModal(false);
        setPassword('');
        setVerificationCode('');
        await loadStatus();
      } else {
        showError(response.message || '2FA devre dışı bırakılamadı');
      }
    } catch (error) {
      showError('2FA devre dışı bırakılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kurtarma kodları oluştur
  const handleGenerateRecoveryCodes = async () => {
    try {
      setLoading(true);
      const response = await twoFactorAPI.generateRecoveryCodes();
      if (response.success) {
        setRecoveryCodes(response.data.codes);
        setShowRecoveryCodes(true);
      } else {
        showError(response.message || 'Kurtarma kodları oluşturulamadı');
      }
    } catch (error) {
      showError('Kurtarma kodları oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Durumu */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            İki Faktörlü Kimlik Doğrulama
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status?.isEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status?.isEnabled ? 'Etkin' : 'Devre Dışı'}
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-medium">Durum:</span> {status?.isEnabled ? 'Etkin' : 'Devre Dışı'}
          </p>
          {status?.lastUsed && (
            <p>
              <span className="font-medium">Son Kullanım:</span> {new Date(status.lastUsed).toLocaleString('tr-TR')}
            </p>
          )}
          <p>
            <span className="font-medium">Kurtarma Kodları:</span> {status?.recoveryCodesRemaining || 0} adet kaldı
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {!status?.isEnabled ? (
            <Button 
              onClick={() => setShowSetupModal(true)}
              className="w-full sm:w-auto"
            >
              2FA Etkinleştir
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGenerateRecoveryCodes}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Kurtarma Kodları Oluştur
              </Button>
              <Button 
                onClick={() => setShowDisableModal(true)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                2FA Devre Dışı Bırak
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 2FA Etkinleştirme Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">2FA Etkinleştir</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrenizi Girin
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleEnable2FA}
                  disabled={loading || !password.trim()}
                  className="flex-1"
                >
                  {loading ? 'İşleniyor...' : 'Başlat'}
                </Button>
                <Button 
                  onClick={() => setShowSetupModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Kod ve Doğrulama Modal */}
      {setupData && showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">2FA Kurulumu</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Google Authenticator veya benzeri bir uygulama ile QR kodu tarayın
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`}
                    alt="QR Code"
                    className="mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Manuel kod: {setupData.manualEntryKey}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6 haneli kodu girin"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleVerify2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSetupData(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Devre Dışı Bırakma Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">2FA Devre Dışı Bırak</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrenizi Girin
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6 haneli kodu girin"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleDisable2FA}
                  disabled={loading || !password.trim() || verificationCode.length !== 6}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? 'İşleniyor...' : 'Devre Dışı Bırak'}
                </Button>
                <Button 
                  onClick={() => setShowDisableModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kurtarma Kodları Modal */}
      {showRecoveryCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Kurtarma Kodları</h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Bu kodları güvenli bir yerde saklayın. Her kod sadece bir kez kullanılabilir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 p-2 rounded text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setShowRecoveryCodes(false)}
                className="w-full"
              >
                Tamam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 