/**
 * Task Form Fields Component
 * 
 * Task form'unun input alanlarını içeren component.
 */

import React from 'react';
import { FaCalendarAlt, FaFlag, FaUser, FaAlignLeft } from 'react-icons/fa';
import type { CategoryDto } from '../../../types/category.types';

interface TaskFormFieldsProps {
  formData: {
    title: string;
    description: string;
    categoryId: number;
    priority: number;
    dueDate: string;
  };
  categories: CategoryDto[];
  errors: Record<string, string>;
  onInputChange: (field: string, value: any) => void;
}

/**
 * Priority options
 */
const priorityOptions = [
  { value: 1, label: 'Yüksek', color: 'text-red-600' },
  { value: 2, label: 'Orta', color: 'text-orange-600' },
  { value: 3, label: 'Düşük', color: 'text-blue-600' },
  { value: 4, label: 'En Düşük', color: 'text-gray-600' },
];

/**
 * TaskFormFields Component
 */
const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  formData,
  categories,
  errors,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Görev Başlığı *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          placeholder="Görev başlığını girin..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.title 
              ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          } text-gray-900 dark:text-white`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FaAlignLeft className="inline w-4 h-4 mr-2" />
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Görev açıklamasını girin..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
      </div>

      {/* Category and Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaUser className="inline w-4 h-4 mr-2" />
            Kategori *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => onInputChange('categoryId', parseInt(e.target.value))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.categoryId 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            } text-gray-900 dark:text-white`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId}</p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaFlag className="inline w-4 h-4 mr-2" />
            Öncelik
          </label>
          <select
            value={formData.priority}
            onChange={(e) => onInputChange('priority', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FaCalendarAlt className="inline w-4 h-4 mr-2" />
          Bitiş Tarihi
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => onInputChange('dueDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
};

export default TaskFormFields; 