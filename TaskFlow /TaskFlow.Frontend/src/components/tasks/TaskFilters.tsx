/**
 * TaskFilters Component
 * 
 * Görev filtreleme ve arama işlevlerini sağlayan component.
 * Arama, kategori, öncelik ve durum filtrelerini içerir.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaCalendarAlt, FaFlag, FaUser, FaTimes } from 'react-icons/fa';
import type { CategoryDto } from '../../types/category.types';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  selectedPriority: number | null;
  onPriorityChange: (priority: number | null) => void;
  selectedStatus: 'all' | 'completed' | 'pending';
  onStatusChange: (status: 'all' | 'completed' | 'pending') => void;
  categories: CategoryDto[];
  showFilters: boolean;
  onToggleFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  categories,
  showFilters,
  onToggleFilters
}) => {
  /**
   * Öncelik seçenekleri
   */
  const priorityOptions = [
    { value: 1, label: 'Yüksek', color: 'text-red-500' },
    { value: 2, label: 'Orta', color: 'text-orange-500' },
    { value: 3, label: 'Düşük', color: 'text-blue-500' },
    { value: 4, label: 'En Düşük', color: 'text-gray-500' }
  ];

  /**
   * Durum seçenekleri
   */
  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'pending', label: 'Bekleyen' },
    { value: 'completed', label: 'Tamamlanan' }
  ] as const;

  /**
   * Aktif filtre sayısını hesaplar
   */
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (selectedCategory !== null) count++;
    if (selectedPriority !== null) count++;
    if (selectedStatus !== 'all') count++;
    return count;
  };

  /**
   * Tüm filtreleri temizler
   */
  const clearAllFilters = () => {
    onCategoryChange(null);
    onPriorityChange(null);
    onStatusChange('all');
    onSearchChange('');
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="mb-6">
      {/* Arama ve Filtre Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Arama Kutusu */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Görevlerde ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filtre Toggle Butonu */}
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
            showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <FaFilter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtreler</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filtre Paneli */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kategori Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline w-4 h-4 mr-1" />
                  Kategori
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Öncelik Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaFlag className="inline w-4 h-4 mr-1" />
                  Öncelik
                </label>
                <select
                  value={selectedPriority || ''}
                  onChange={(e) => onPriorityChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tüm Öncelikler</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durum Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value as 'all' | 'completed' | 'pending')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre Temizleme */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <FaTimes className="w-3 h-3" />
                  Tüm filtreleri temizle
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskFilters; 