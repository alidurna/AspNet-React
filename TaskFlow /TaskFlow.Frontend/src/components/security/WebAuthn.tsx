import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { webAuthnAPI } from '../../services/api';
import type { WebAuthnStatus, WebAuthnCredential } from '../../types/auth.types';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';

/**
 * WebAuthn (Biyometrik Giriş) Bileşeni
 * 
 * Bu bileşen kullanıcıların:
 * - Biyometrik giriş (Face ID, Touch ID) kurmasını
 * - WebAuthn credential'larını yönetmesini
 * - Biyometrik girişi etkinleştirmesini/devre dışı bırakmasını sağlar
 */
export const WebAuthn: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [status, setStatus] = useState<WebAuthnStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<WebAuthnCredential | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  // WebAuthn desteğini kontrol et
  useEffect(() => {
    checkWebAuthnSupport();
    loadStatus();
  }, []);

  const checkWebAuthnSupport = async () => {
    try {
      const supported = window.PublicKeyCredential && 
                       await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(supported);
    } catch (error) {
      setIsSupported(false);
    }
  };

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await webAuthnAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      showError('Biyometrik giriş durumu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Biyometrik giriş kaydı başlat
  const handleStartRegistration = async () => {
    if (!displayName.trim()) {
      showError('Giriş adını girin');
      return;
    }

    try {
      setLoading(true);
      const response = await webAuthnAPI.startRegistration({
        username: 'test@test.com', // Kullanıcı email'i
        displayName: displayName.trim()
      });

      if (response.success) {
        // WebAuthn API ile credential oluştur
        const credential = await navigator.credentials.create({
          publicKey: response.data.publicKeyCredentialCreationOptions
        });

        if (credential) {
          // Kayıt tamamla
          const completeResponse = await webAuthnAPI.completeRegistration({
            sessionId: response.data.sessionId,
            attestationResponse: credential
          });

          if (completeResponse.success) {
            showSuccess('Biyometrik giriş başarıyla kuruldu!');
            setShowRegisterModal(false);
            setDisplayName('');
            await loadStatus();
          } else {
            showError(completeResponse.message || 'Biyometrik giriş kurulamadı');
          }
        }
      } else {
        showError(response.message || 'Biyometrik giriş kaydı başlatılamadı');
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      showError('Biyometrik giriş kurulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Biyometrik giriş sil
  const handleDeleteCredential = async () => {
    if (!selectedCredential) return;

    try {
      setLoading(true);
      const response = await webAuthnAPI.deleteCredential(selectedCredential.id);
      if (response.success) {
        showSuccess('Biyometrik giriş başarıyla silindi');
        setShowDeleteModal(false);
        setSelectedCredential(null);
        await loadStatus();
      } else {
        showError(response.message || 'Biyometrik giriş silinemedi');
      }
    } catch (error) {
      showError('Biyometrik giriş silinirken hata oluştu');
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
      {/* WebAuthn Durumu */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Biyometrik Giriş (WebAuthn)
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
            <span className="font-medium">Tarayıcı Desteği:</span> 
            <span className={`ml-2 ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
              {isSupported ? 'Destekleniyor' : 'Desteklenmiyor'}
            </span>
          </p>
          <p>
            <span className="font-medium">Durum:</span> {status?.isEnabled ? 'Etkin' : 'Devre Dışı'}
          </p>
          <p>
            <span className="font-medium">Kayıtlı Cihazlar:</span> {status?.credentials?.length || 0} adet
          </p>
        </div>

        {/* Kayıtlı Cihazlar */}
        {status?.credentials && status.credentials.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Kayıtlı Cihazlar</h4>
            <div className="space-y-2">
              {status.credentials.map((credential) => (
                <div key={credential.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{credential.name}</p>
                    <p className="text-sm text-gray-600">
                      Oluşturulma: {new Date(credential.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    {credential.lastUsedAt && (
                      <p className="text-sm text-gray-600">
                        Son Kullanım: {new Date(credential.lastUsedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCredential(credential);
                      setShowDeleteModal(true);
                    }}
                  >
                    Sil
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          {isSupported && !status?.isEnabled ? (
            <Button 
              onClick={() => setShowRegisterModal(true)}
              className="w-full sm:w-auto"
            >
              Biyometrik Giriş Kur
            </Button>
          ) : !isSupported ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              Tarayıcınız biyometrik girişi desteklemiyor. 
              Chrome, Safari veya Firefox'un güncel sürümlerini kullanın.
            </div>
          ) : null}
        </div>
      </Card>

      {/* Kayıt Modal */}
      <Dialog
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biyometrik Giriş Kur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Biyometrik giriş kurarak Face ID, Touch ID veya güvenlik anahtarı ile giriş yapabilirsiniz.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giriş Adı
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Örn: iPhone Face ID"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegisterModal(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              onClick={handleStartRegistration}
              disabled={loading || !displayName.trim()}
            >
              {loading ? 'Kuruluyor...' : 'Kur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Modal */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biyometrik Giriş Sil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <strong>{selectedCredential?.name}</strong> cihazından biyometrik girişi kaldırmak istediğinizden emin misiniz?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCredential}
              disabled={loading}
            >
              {loading ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 