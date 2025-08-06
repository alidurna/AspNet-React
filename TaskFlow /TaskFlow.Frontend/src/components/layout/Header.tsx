/**
 * Header Component - Refactored
 * 
 * Modüler component'ler kullanılarak refactor edilmiş header.
 * HeaderSearch, HeaderUserMenu gibi küçük component'lere bölündü.
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
          {/* Sidebar toggle for mobile/tablet */}
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
            title="Sidebar'ı aç/kapat"
          >
            <FaBars className="w-5 h-5" />
          </button>
          {/* Search bar */}
          <div className="hidden md:block">
            <HeaderSearch />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
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