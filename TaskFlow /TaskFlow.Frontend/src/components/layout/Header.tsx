/**
 * Header Component - Responsive Design
 * 
 * Responsive header tasarımı. Tüm ekran boyutlarında sidebar toggle butonu
 * ve responsive search bar içerir.
 */

import React from 'react';
import { FaBars } from 'react-icons/fa';
import HeaderSearch from './HeaderSearch';
import HeaderUserMenu from './HeaderUserMenu';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button - visible on all screen sizes */}
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Sidebar'ı aç/kapat"
            aria-label="Sidebar'ı aç/kapat"
          >
            <FaBars className="w-5 h-5" />
          </button>
          
          {/* Search bar - hidden on mobile, visible on tablet and desktop */}
          <div className="hidden sm:block flex-1 max-w-md">
            <HeaderSearch />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Mobile search - visible only on mobile */}
          <div className="sm:hidden">
            <HeaderSearch />
          </div>
          
          <ThemeToggle />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header; 