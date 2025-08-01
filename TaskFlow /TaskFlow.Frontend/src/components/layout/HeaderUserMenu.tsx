/**
 * HeaderUserMenu Component
 * 
 * Header'ın kullanıcı menüsü kısmını yöneten component.
 * User profile, settings, notifications ve logout işlemlerini yönetir.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../ui/ConfirmModal';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * HeaderUserMenu Props
 */
interface HeaderUserMenuProps {
  className?: string;
}

/**
 * HeaderUserMenu Component
 */
const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  className = '',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle navigation to profile
   */
  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate('/profile');
  };

  /**
   * Handle navigation to settings
   */
  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    navigate('/settings');
  };

  /**
   * Handle logout confirmation
   */
  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.showSuccess('Başarıyla çıkış yaptınız');
      navigate('/login');
    } catch (error) {
      toast.showError('Çıkış yapılırken bir hata oluştu');
    }
  };

  /**
   * Handle notifications click
   */
  const handleNotificationsClick = () => {
    toast.showInfo('Bildirim merkezi yakında eklenecek!');
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (user: any) => {
    if (!user) return 'Kullanıcı';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return user.email || 'Kullanıcı';
  };

  return (
    <>
      <div className={`flex items-center space-x-3 ${className}`} ref={menuRef}>
        {/* Notifications */}
        <button
          onClick={handleNotificationsClick}
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Bildirimler"
        >
          <FaBell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {getUserInitials(user)}
            </div>
            
            {/* User Name (hidden on mobile) */}
            <span className="hidden md:block text-sm font-medium">
              {getUserDisplayName(user)}
            </span>
            
            {/* Dropdown Arrow */}
            <FaChevronDown 
              className={`w-3 h-3 transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials(user)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'email@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaUser className="w-4 h-4" />
                  <span>Profil</span>
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaCog className="w-4 h-4" />
                  <span>Ayarlar</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Çıkış Yap"
        message="Çıkış yapmak istediğinizden emin misiniz?"
        confirmButtonText="Çıkış Yap"
        cancelButtonText="İptal"
      />
    </>
  );
};

export default HeaderUserMenu; 