/**
 * ProfileHeader Component
 * 
 * Profil sayfasının üst kısmındaki başlık ve navigasyon alanı.
 * Kullanıcı adı, rol bilgisi ve sayfa başlığını gösterir.
 */

import React from 'react';
import { FaUser, FaCog, FaShieldAlt } from 'react-icons/fa';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  isEmailVerified: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userEmail,
  isEmailVerified
}) => {
  return (
    <div className="mb-8">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profil Ayarları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hesap bilgilerinizi yönetin ve güvenlik ayarlarınızı düzenleyin
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <FaCog className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Ayarlar</span>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FaUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userName}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {userEmail}
                </span>
                {isEmailVerified ? (
                  <div className="flex items-center gap-1">
                    <FaShieldAlt className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Doğrulandı
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <FaShieldAlt className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      Doğrulanmadı
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Üyelik Durumu
            </div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              Aktif Kullanıcı
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 