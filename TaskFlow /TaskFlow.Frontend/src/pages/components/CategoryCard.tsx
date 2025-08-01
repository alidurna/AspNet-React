/**
 * Category Card Component
 * 
 * Tek bir kategoriyi gösteren card component.
 */

import React from 'react';
import { FaEdit, FaTrash, FaTasks } from 'react-icons/fa';
import type { CategoryDto } from '../../types/category.types';
import Card from '../../components/ui/Card';

interface CategoryCardProps {
  category: CategoryDto;
  onEdit: (category: CategoryDto) => void;
  onDelete: (categoryId: number) => void;
}

/**
 * CategoryCard Component
 */
const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {category.colorCode && (
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: category.colorCode }}
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Düzenle"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Sil"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <FaTasks className="w-4 h-4" />
          <span>{category.taskCount || 0} görev</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            category.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {category.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard; 