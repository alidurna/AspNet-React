/**
 * Sidebar Component - Standard Design
 * 
 * Standart ve basit sidebar tasarımı.
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
 * Standart sidebar tasarımı.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  // ===== EVENT HANDLERS =====
  /**
   * Handle overlay click - KALDIRILDI
   */
  // const handleOverlayClick = () => {
  //   onToggle();
  // };

  /**
   * Handle navigation item click - KALDIRILDI
   */
  // const handleNavigationClick = () => {
  //   // Sidebar'ı kapatma - sadece mobilde kapatılacak
  //   // if (window.innerWidth < 1024) {
  //   //   onToggle();
  //   // }
  // };

  /**
   * Handle logout - KALDIRILDI
   */
  // const handleLogout = () => {
  //   // Sidebar'ı kapatma - sadece mobilde kapatılacak
  //   // if (window.innerWidth < 1024) {
  //   //   onToggle();
  //   // }
  // };

  // ===== RENDER =====
  return (
    <>
      {/* Overlay tamamen kaldırıldı - sidebar her zaman açık kalacak */}

      {/* Standard Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Container */}
        <div className="flex flex-col h-full">
          {/* Standard Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </h1>
            </div>

            {/* Standard Close Button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto">
            <SidebarNavigation 
              isOpen={isOpen}
            />
          </div>

          {/* Standard User Section */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <SidebarUserSection 
              isOpen={isOpen}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
