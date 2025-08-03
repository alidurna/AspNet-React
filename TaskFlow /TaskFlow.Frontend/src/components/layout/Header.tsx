/**
 * Header Component - Refactored
 * 
 * Modüler component'ler kullanılarak refactor edilmiş header.
 * HeaderSearch, HeaderUserMenu gibi küçük component'lere bölündü.
 */

import React from 'react';
import { FaBars } from 'react-icons/fa';

// Refactored Components
import HeaderSearch from './HeaderSearch';
import HeaderUserMenu from './HeaderUserMenu';

/**
 * Breadcrumb Item Interface
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Header Props
 */
interface HeaderProps {
  onSidebarToggle: () => void;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Header Component
 */
const Header: React.FC<HeaderProps> = ({
  onSidebarToggle,
  title = 'TaskFlow',
  breadcrumbs = [],
}) => {
  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Search logic will be implemented here
  };

  /**
   * Handle advanced search
   */
  const handleAdvancedSearch = (filters: any) => {
    console.log('Advanced search filters:', filters);
    // Advanced search logic will be implemented here
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              <FaBars className="w-5 h-5" />
            </button>

            {/* Title & Breadcrumbs */}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              
              {breadcrumbs.length > 0 && (
                <nav className="flex text-sm text-gray-500 dark:text-gray-400">
                  {breadcrumbs.map((item, index) => (
                    <span key={index} className="flex items-center">
                      {index > 0 && <span className="mx-2">/</span>}
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {/* Center Section - Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <HeaderSearch
              className="w-full"
              onSearch={handleSearch}
              onAdvancedSearch={handleAdvancedSearch}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search (Mobile) */}
            <div className="md:hidden">
              <HeaderSearch
                className="w-64"
                onSearch={handleSearch}
                onAdvancedSearch={handleAdvancedSearch}
              />
            </div>

            {/* User Menu */}
            <HeaderUserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 