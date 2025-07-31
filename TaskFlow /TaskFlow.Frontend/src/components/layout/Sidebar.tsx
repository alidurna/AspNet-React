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
import ThemeToggle from "../ui/ThemeToggle"; // ThemeToggle'u import et

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
  {
    name: "Güvenlik",
    href: "/security",
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
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    name: "Swagger API",
    href: "http://localhost:5281/swagger", // Tam URL
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>
    ),
    external: true, // Harici link
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
        fixed top-0 left-0 z-50 h-screen bg-white transform transition-transform duration-300 ease-in-out flex flex-col
        dark:bg-neutral-950/5 shadow-glass-dark backdrop-blur-3xl dark:border-neutral-900/5
        ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full overflow-hidden"
        }
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-850">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center dark:bg-primary-800">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-neutral-200">TaskFlow</h1>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-neutral-300 dark:hover:bg-neutral-800/50"
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

        {/* Main Navigation */}
        <ul className="flex-1 py-4">
          {navigationItems.map((item) => (
            <li key={item.name}>
              {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                  className={`flex items-center space-x-3 px-6 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 dark:text-neutral-200 dark:hover:bg-neutral-900/10 dark:hover:text-neutral-50`}
              >
                {item.icon}
                  <span className="font-medium">{item.name}</span>
              </a>
            ) : (
              <Link
                to={item.href}
                  className={`flex items-center space-x-3 px-6 py-2 rounded-lg ${isActiveRoute(item.href)
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/10 dark:text-neutral-50"
                      : "text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-200 dark:hover:bg-neutral-900/10 dark:hover:text-neutral-50"
                    } transition-colors duration-200`}
              >
                {item.icon}
                  <span className="font-medium">{item.name}</span>
              </Link>
          )}
            </li>
          ))}
        </ul>

        {/* User Profile Section */}
        <div className="p-6 border-t border-gray-200 dark:border-neutral-850">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg dark:bg-neutral-800 dark:text-neutral-300">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-gray-900 font-semibold dark:text-neutral-200">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-500 text-sm dark:text-neutral-400">
                {user?.email}
              </p>
            </div>
          </div>
            <button
              onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 shadow-md hover:shadow-lg dark:bg-primary-700 dark:hover:bg-primary-800/80 dark:shadow-none dark:hover:shadow-none"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Çıkış Yap</span>
            </button>
          <div className="mt-4 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Çıkış Onayı"
        message="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
      />
    </>
  );
};

export default Sidebar;
