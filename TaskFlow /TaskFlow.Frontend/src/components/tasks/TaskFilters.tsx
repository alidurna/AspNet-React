/**
 * TaskFilters Component - Yeni Tasarım
 * 
 * Görev filtreleme component'i.
 */

import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import type { CategoryDto } from '../../types/tasks';

interface TaskFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  categories: CategoryDto[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  selectedPriority: number | null;
  onPriorityChange: (priority: number | null) => void;
  selectedStatus: 'all' | 'completed' | 'pending';
  onStatusChange: (status: 'all' | 'completed' | 'pending') => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  isOpen,
  onToggle,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FaFilter className="w-4 h-4" />
          Filtreler
        </h3>
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Kategori
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Öncelik
          </label>
          <select
            value={selectedPriority || ''}
            onChange={(e) => onPriorityChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tüm Öncelikler</option>
            <option value={1}>Düşük</option>
            <option value={2}>Orta</option>
            <option value={3}>Yüksek</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Durum
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'completed' | 'pending')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tümü</option>
            <option value="pending">Devam Eden</option>
            <option value="completed">Tamamlanan</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters; 