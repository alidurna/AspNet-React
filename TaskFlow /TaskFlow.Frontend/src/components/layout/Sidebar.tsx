/**
 * Sidebar Component - Responsive Design
 * 
 * Responsive sidebar tasarımı. Mobile ve tablet boyutlarında overlay ile çalışır,
 * desktop boyutlarında static pozisyonda kalır.
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
    <>
      {/* Sidebar Component */}
      <div 
        className={`
          fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-neutral-850 
          border-r border-gray-200 dark:border-gray-700 flex flex-col 
          transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto
          ${isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto z-50' 
            : '-translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto lg:w-64 lg:z-auto'
          }
        `}
        style={{ 
          zIndex: isOpen ? 1000 : 'auto',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {/* Top Section - Logo and Close Button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-850">
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-gray-50 dark:bg-neutral-850">
          <SidebarNavigation onItemClick={() => {
            // Mobile'ta sidebar'ı kapat
            if (window.innerWidth < 1024) {
              onToggle();
            }
          }} />
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-850">
          <SidebarUserSection />
        </div>
      </div>

      {/* Overlay for mobile and tablet */}
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 
          lg:hidden transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
        aria-hidden="true"
        style={{ zIndex: 999 }}
      />
    </>
  );
};

export default Sidebar;
