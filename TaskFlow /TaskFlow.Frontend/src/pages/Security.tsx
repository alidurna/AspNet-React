import React from 'react';

import { TwoFactorAuth } from '../components/security/TwoFactorAuth';
import { WebAuthn } from '../components/security/WebAuthn';
import Card from '../components/ui/Card';

/**
 * Güvenlik Sayfası
 * 
 * Bu sayfa kullanıcıların güvenlik ayarlarını yönetmesini sağlar:
 * - İki Faktörlü Kimlik Doğrulama (2FA)
 * - Biyometrik Giriş (WebAuthn)
 * - Güvenlik ayarları ve durumları
 */
const Security: React.FC = () => {
  return (
    <div>
      <div className="space-y-8">
        {/* Sayfa Başlığı */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Güvenlik Ayarları</h1>
          <p className="mt-2 text-gray-600">
            Hesabınızın güvenliğini artırmak için güvenlik özelliklerini yönetin.
          </p>
        </div>

        {/* Güvenlik Özellikleri */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 2FA Bileşeni */}
          <Card className="p-6">
            <TwoFactorAuth />
          </Card>

          {/* WebAuthn Bileşeni */}
          <Card className="p-6">
            <WebAuthn />
          </Card>
        </div>

        {/* Güvenlik İpuçları */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Güvenlik İpuçları
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>İki Faktörlü Kimlik Doğrulama:</strong> Hesabınıza ekstra güvenlik katmanı ekler. 
                Şifreniz ele geçirilse bile hesabınız güvende kalır.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Biyometrik Giriş:</strong> Face ID, Touch ID veya güvenlik anahtarı ile 
                hızlı ve güvenli giriş yapın. Şifre hatırlamaya gerek kalmaz.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Güçlü Şifre:</strong> En az 8 karakter, büyük/küçük harf, sayı ve özel karakter 
                içeren güçlü bir şifre kullanın.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Kurtarma Kodları:</strong> 2FA kurulumu sırasında oluşturulan kurtarma kodlarını 
                güvenli bir yerde saklayın. Acil durumlarda hesabınıza erişim sağlar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Security; 