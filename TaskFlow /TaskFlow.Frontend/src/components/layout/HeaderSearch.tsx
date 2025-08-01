/**
 * HeaderSearch Component
 * 
 * Header'ın arama kısmını yöneten component.
 * Global search, advanced search modal ve search history'yi yönetir.
 */

import React, { useState, useRef } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import AdvancedSearchModal from '../search/AdvancedSearchModal';

/**
 * HeaderSearch Props
 */
interface HeaderSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onAdvancedSearch?: (filters: any) => void;
}

/**
 * HeaderSearch Component
 */
const HeaderSearch: React.FC<HeaderSearchProps> = ({
  className = '',
  placeholder = 'Görevlerde ara...',
  onSearch,
  onAdvancedSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  /**
   * Search input change handler
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Real-time search (debounced in parent)
    if (onSearch) {
      onSearch(query);
    }
  };

  /**
   * Search form submit handler
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.showWarning('Arama yapmak için bir kelime girin');
      return;
    }

    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  /**
   * Clear search handler
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
    searchInputRef.current?.focus();
  };

  /**
   * Advanced search handler
   */
  const handleAdvancedSearch = (filters: any) => {
    setShowAdvancedSearch(false);
    
    if (onAdvancedSearch) {
      onAdvancedSearch(filters);
    }
    
    toast.showInfo('Gelişmiş arama filtreleri uygulandı');
  };

  /**
   * Keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <form onSubmit={handleSearchSubmit} className="relative">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                block w-full pl-10 pr-12 py-2 
                border border-gray-300 dark:border-gray-600 
                rounded-lg bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white 
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
                ${isFocused ? 'shadow-lg' : 'shadow-sm'}
              `}
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}

            {/* Advanced Search Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(true)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Gelişmiş Arama"
            >
              <FaFilter className="h-4 w-4" />
            </button>
          </div>

          {/* Search Suggestions (Future Feature) */}
          {isFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                "{searchQuery}" için arama yapılıyor...
              </div>
            </div>
          )}
        </form>

        {/* Keyboard Shortcut Hint */}
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-400 hidden md:block">
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">
            Ctrl+K
          </kbd>{' '}
          ile ara
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </>
  );
};

export default HeaderSearch; 