/**
 * SidebarUserSection Component
 * 
 * Sidebar'dan çıkarılan kullanıcı profil bölümü component'i.
 * Kullanıcı bilgileri, avatar ve logout işlemlerini yönetir.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../ui/ConfirmModal";

interface SidebarUserSectionProps {
  isOpen?: boolean;
}

/**
 * SidebarUserSection Component
 * 
 * Kullanıcı profil bilgilerini ve logout işlemlerini yönetir.
 * Collapsible user menu sağlar.
 */
export const SidebarUserSection: React.FC<SidebarUserSectionProps> = ({
  isOpen = true
}) => {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // ===== STATE =====
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);

  // ===== EVENT HANDLERS =====
  /**
   * Handle logout confirmation
   */
  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Handle logout cancel
   */
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  /**
   * Toggle user menu
   */
  const toggleUserMenu = () => {
    setIsUserMenuExpanded(!isUserMenuExpanded);
  };

  // ===== HELPER FUNCTIONS =====
  /**
   * Get user initials for avatar
   */
  const getUserInitials = (): string => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (): string => {
    if (!user) return "Kullanıcı";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Kullanıcı";
  };

  // ===== RENDER =====
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Standard User Section */}
      <div className="p-4">
        <div className="flex items-center">
          {/* Standard User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
          </div>

          {/* Standard User Info */}
          <div className="ml-3 flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUserMenu();
              }}
              className="w-full text-left flex items-center justify-between group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className="ml-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {isUserMenuExpanded ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Standard Expanded User Menu */}
            {isUserMenuExpanded && (
              <div className="mt-2 space-y-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Sidebar'ı her zaman açık tut
                    localStorage.setItem('sidebarOpen', 'true');
                    
                    // Sidebar'ı zorla açık tut
                    setTimeout(() => {
                      localStorage.setItem('sidebarOpen', 'true');
                    }, 100);
                    
                    navigate('/profile');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md flex items-center"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  Profili Görüntüle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Sidebar'ı her zaman açık tut
                    localStorage.setItem('sidebarOpen', 'true');
                    
                    // Sidebar'ı zorla açık tut
                    setTimeout(() => {
                      localStorage.setItem('sidebarOpen', 'true');
                    }, 100);
                    
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md flex items-center"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <ConfirmModal
          isOpen={showLogoutModal}
          title="Çıkış Yap"
          message="Oturumunuzu kapatmak istediğinizden emin misiniz?"
          confirmButtonText="Çıkış Yap"
          cancelButtonText="İptal"
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </>
  );
};

export default SidebarUserSection; 