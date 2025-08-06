/**
 * Sidebar Component - Standard Design
 * 
 * Standart ve basit sidebar tasarımı.
 */

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import SidebarNavigation from './SidebarNavigation';
import SidebarUserSection from './SidebarUserSection';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Top Section - Logo and Close Button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        <button
          onClick={onToggle}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Sidebar'ı kapat"
          title="Sidebar'ı kapat"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <SidebarNavigation />
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <SidebarUserSection />
      </div>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onToggle}
        aria-hidden="true"
      ></div>
    </div>
  );
};

export default Sidebar;
