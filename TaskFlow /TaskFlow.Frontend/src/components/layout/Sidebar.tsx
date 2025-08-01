/**
 * Sidebar Component - Refactored
 * 
 * Modüler component'lere bölünmüş sidebar. Ana sorumluluk sadece
 * layout ve orchestration. Navigation ve User section ayrı component'lerde.
 */

import React from "react";
import { FiMenu, FiX } from "react-icons/fi";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUserSection from "./SidebarUserSection";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Sidebar Component
 * 
 * Ana sidebar layout component'i. Navigation ve User section'ı
 * modüler component'ler olarak kullanır.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  // ===== EVENT HANDLERS =====
  /**
   * Handle overlay click (mobile)
   */
  const handleOverlayClick = () => {
    onToggle();
  };

  /**
   * Handle navigation item click (mobile)
   */
  const handleNavigationClick = () => {
    // Mobile'da menü öğesine tıklayınca sidebar'ı kapat
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // Mobile'da logout sonrası sidebar'ı kapat
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  // ===== RENDER =====
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </h1>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <SidebarNavigation 
            isOpen={isOpen} 
            onItemClick={handleNavigationClick}
          />

          {/* User Section */}
          <div className="mt-auto">
            <SidebarUserSection 
              isOpen={isOpen} 
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
