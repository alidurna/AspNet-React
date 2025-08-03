/**
 * TaskFilters Component
 * 
 * Görev filtreleme ve arama işlevlerini sağlayan component.
 * Arama, kategori, öncelik ve durum filtrelerini içerir.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaCalendarAlt, FaFlag, FaUser, FaTimes } from 'react-icons/fa';
import type { CategoryDto } from '../../types/tasks';

interface TaskFiltersProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  selectedPriority: number | null;
  onPriorityChange: (priority: number | null) => void;
  selectedStatus: 'all' | 'completed' | 'pending';
  onStatusChange: (status: 'all' | 'completed' | 'pending') => void;
  categories: CategoryDto[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  categories,
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
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Filtre başlığı */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FaFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtreler
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Görevlerinizi filtreleyerek daha kolay bulun
            </p>
          </div>
        </div>
        
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            <FaTimes className="w-3 h-3" />
            <span>Temizle ({activeFilterCount})</span>
          </motion.button>
        )}
      </div>

      {/* Filtre kartları grid'i */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kategori Filtresi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
              <FaUser className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Kategori</span>
          </label>
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Öncelik Filtresi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
              <FaFlag className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Öncelik</span>
          </label>
          <div className="relative">
            <select
              value={selectedPriority || ''}
              onChange={(e) => onPriorityChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Tüm Öncelikler</option>
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Durum Filtresi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
              <FaCalendarAlt className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <span>Durum</span>
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as 'all' | 'completed' | 'pending')}
              className="w-full appearance-none px-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Aktif filtreler göstergesi */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {activeFilterCount} filtre aktif
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
              {selectedCategory && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                  Kategori: {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
              {selectedPriority && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                  Öncelik: {priorityOptions.find(p => p.value === selectedPriority)?.label}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                  Durum: {statusOptions.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskFilters; 