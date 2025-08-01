/**
 * Tasks Header Component
 * 
 * Tasks sayfasının header kısmını yöneten component.
 * View mode toggle, search ve filter butonları içerir.
 */

import React from 'react';
import { FaPlus, FaColumns, FaList, FaTh, FaFilter } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';

interface TasksHeaderProps {
  viewMode: 'grid' | 'list' | 'kanban';
  onViewModeChange: (mode: 'grid' | 'list' | 'kanban') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateTask: () => void;
  tasksCount: number;
  completedCount: number;
}

/**
 * TasksHeader Component
 */
const TasksHeader: React.FC<TasksHeaderProps> = ({
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onCreateTask,
  tasksCount,
  completedCount,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Header Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Görevlerim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tasksCount} görev • {completedCount} tamamlandı
          </p>
        </div>
        
        <Button
          onClick={onCreateTask}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Görevlerde ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Grid Görünümü"
            >
              <FaTh className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Liste Görünümü"
            >
              <FaList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Kanban Görünümü"
            >
              <FaColumns className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Filtreleri Göster/Gizle"
          >
            <FaFilter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksHeader; 