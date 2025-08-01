/**
 * Two Factor Status Component
 * 
 * 2FA durumunu gösteren component.
 */

import React from 'react';
import { Button } from '../../ui/Button';
import Card from '../../ui/Card';
import type { TwoFactorStatus as TwoFactorStatusType } from '../../../types/auth.types';

interface TwoFactorStatusProps {
  status: TwoFactorStatusType | null;
  loading: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onShowRecoveryCodes: () => void;
}

/**
 * TwoFactorStatus Component
 */
const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({
  status,
  loading,
  onEnable,
  onDisable,
  onShowRecoveryCodes,
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          İki Faktörlü Kimlik Doğrulama (2FA)
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status?.isEnabled 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {status?.isEnabled ? 'Etkin' : 'Devre Dışı'}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {status?.isEnabled 
          ? 'Hesabınız iki faktörlü kimlik doğrulama ile korunuyor. Giriş yaparken telefonunuzdaki uygulamadan kod girmeniz gerekecek.'
          : 'Hesabınızın güvenliğini artırmak için iki faktörlü kimlik doğrulamayı etkinleştirin.'
        }
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {!status?.isEnabled ? (
          <Button onClick={onEnable} className="flex-1">
            2FA'yı Etkinleştir
          </Button>
        ) : (
          <>
            <Button 
              onClick={onShowRecoveryCodes} 
              variant="outline" 
              className="flex-1"
            >
              Kurtarma Kodları
            </Button>
            <Button 
              onClick={onDisable} 
              variant="outline" 
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              2FA'yı Devre Dışı Bırak
            </Button>
          </>
        )}
      </div>

      {status?.isEnabled && status.lastUsed && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Son kullanım: {new Date(status.lastUsed).toLocaleString('tr-TR')}
          </p>
        </div>
      )}
    </Card>
  );
};

export default TwoFactorStatus; 