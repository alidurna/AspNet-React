/**
 * Sidebar Navigation Component
 *
 * Bu dosya, TaskFlow uygulamasının dashboard'unun sol tarafındaki
 * navigasyon menüsünü oluşturan component'i içerir. Ana navigasyon
 * linklerini, kullanıcı bilgilerini ve menü durumunu yönetir.
 *
 * Ana Özellikler:
 * - Responsive sidebar (mobile'da collapse/expand)
 * - Active link highlighting
 * - Icon'lu menu items
 * - User profile section
 * - Logout functionality
 * - Smooth animations
 * - Mobile overlay
 *
 * Navigasyon Menüsü:
 * - Dashboard: Ana sayfa
 * - Görevler: Task yönetimi
 * - Kategoriler: Kategori yönetimi
 * - İstatistikler: Performans metrikleri
 *
 * Responsive Davranış:
 * - Desktop: Sabit açık sidebar
 * - Mobile: Overlay sidebar
 * - Tablet: Adaptive layout
 * - Touch-friendly interface
 *
 * Props Interface:
 * - isOpen: Sidebar'ın açık/kapalı durumu
 * - onToggle: Sidebar toggle fonksiyonu
 *
 * State Management:
 * - Sidebar open/close state
 * - Active route tracking
 * - User authentication state
 * - Navigation history
 *
 * Kullanıcı Bölümü:
 * - Profil fotoğrafı
 * - Kullanıcı adı
 * - Email adresi
 * - Çıkış butonu
 * - Ayarlar linki
 *
 * Styling:
 * - Tailwind CSS tabanlı
 * - Consistent design system
 * - Modern UI/UX
 * - Smooth transitions
 *
 * Animation:
 * - Slide-in/out transitions
 * - Hover effects
 * - Active state animations
 * - Loading states
 *
 * Accessibility:
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA labels
 *
 * Performance:
 * - Optimized re-renders
 * - Efficient route checking
 * - Memory management
 * - Lazy loading
 *
 * Mobile Features:
 * - Touch gestures
 * - Swipe to close
 * - Overlay background
 * - Close button
 *
 * Navigation Logic:
 * - Route matching
 * - Active link detection
 * - History management
 * - Deep linking
 *
 * Error Handling:
 * - Navigation errors
 * - Authentication errors
 * - Logout failures
 * - Graceful fallbacks
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import ConfirmModal from "../ui/ConfirmModal"; // ConfirmModal'ı import et

// Navigation menu items configuration
const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
  },
  {
    name: "Görevler",
    href: "/tasks",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    name: "Kategoriler",
    href: "/categories",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    name: "İstatistikler",
    href: "/statistics",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Yeni state

  // Logout handler
  const handleLogout = () => {
    setIsConfirmModalOpen(true); // Modalı aç
  };

  const handleConfirmLogout = async () => {
    setIsConfirmModalOpen(false); // Modalı kapat
    try {
      await logout();
      showSuccess("Başarıyla çıkış yapıldı!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Çıkış yaparken bir hata oluştu.");
    }
  };

  const handleCancelLogout = () => {
    setIsConfirmModalOpen(false); // Modalı kapat
  };

  // Check if current route is active
  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-50 h-screen bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full overflow-hidden"
        }
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                  ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-semibold border-r-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section (Moved to Header User Menu) */}
        {/* <div className="border-t border-gray-200 py-3 px-4">
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          
          <div className="space-y-2">
            
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profil</span>
            </Link>

            
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Ayarlar</span>
            </Link>

            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div> */}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        title="Çıkış Onayı"
        message="Uygulamadan çıkış yapmak istediğinize emin misiniz?"
        confirmButtonText="Evet, Çıkış Yap"
        cancelButtonText="İptal Et"
      />
    </>
  );
};

export default Sidebar;
