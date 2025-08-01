/**
 * Categories Header Component
 * 
 * Categories sayfasının header kısmını yöneten component.
 */

import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

interface CategoriesHeaderProps {
  onAddCategory: () => void;
  categoriesCount: number;
}

/**
 * CategoriesHeader Component
 */
const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  onAddCategory,
  categoriesCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Kategoriler
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {categoriesCount} kategori mevcut
        </p>
      </div>
      
      <Button
        onClick={onAddCategory}
        className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FaPlus className="w-4 h-4 mr-2" />
        Yeni Kategori
      </Button>
    </div>
  );
};

export default CategoriesHeader; 