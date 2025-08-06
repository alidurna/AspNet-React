/**
 * SidebarUserSection Component
 * 
 * Sidebar'dan çıkarılan kullanıcı profil bölümü component'i.
 * Kullanıcı bilgileri, avatar ve logout işlemlerini yönetir.
 */

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';

interface SidebarUserSectionProps {
  onLogout?: () => void; // Opsiyonel prop
}

const SidebarUserSection: React.FC<SidebarUserSectionProps> = ({
  onLogout
}) => {
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const currentUser = {
    name: user ? `${user.firstName} ${user.lastName}`.trim() || user.email?.split('@')[0] || 'Kullanıcı' : 'Kullanıcı',
    email: user?.email || 'kullanici@taskflow.com',
  };

  const handleLogoutConfirm = () => {
    logout();
    onLogout?.(); // Eğer prop varsa çağır
    setIsConfirmModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <FaUserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {currentUser.email}
            </span>
          </div>
        </div>
        {isUserMenuExpanded ? <FaChevronUp className="w-4 h-4 text-gray-500" /> : <FaChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {isUserMenuExpanded && (
        <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 mb-2 z-50 border border-gray-200 dark:border-gray-600 animate-fade-in-up transform-gpu will-change-transform">
          <button
            onClick={() => {
              navigate('/profile');
              setIsUserMenuExpanded(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <FaUserCircle className="w-4 h-4" />
            <span className="text-sm">Profilim</span>
          </button>
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="text-sm">Çıkış Yap</span>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Çıkış Yap"
        message="Hesabınızdan çıkış yapmak istediğinizden emin misiniz?"
        confirmButtonText="Evet, Çıkış Yap"
        cancelButtonText="İptal"
      />
    </div>
  );
};

export default SidebarUserSection; 