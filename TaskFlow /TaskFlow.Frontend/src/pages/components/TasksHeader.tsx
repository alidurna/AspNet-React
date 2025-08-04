/**
 * Tasks Header Component
 * 
 * Tasks sayfasının header kısmını yöneten component.
 * View mode toggle, search ve filter butonları içerir.
 */

import React from 'react';
import { FaPlus, FaColumns, FaList, FaTh, FaFilter, FaSearch } from 'react-icons/fa';
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
      {/* Header Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Görevlerim
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {tasksCount} görev
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {completedCount} tamamlandı
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={onCreateTask}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Yeni Görev
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Görevlerde ara... (başlık, açıklama)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* View Mode Toggle and Filter */}
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { mode: 'grid', icon: FaTh, title: 'Grid Görünümü' },
              { mode: 'list', icon: FaList, title: 'Liste Görünümü' },
              { mode: 'kanban', icon: FaColumns, title: 'Kanban Görünümü' }
            ].map(({ mode, icon: Icon, title }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode as 'grid' | 'list' | 'kanban')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={title}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`p-2.5 rounded-lg border transition-all duration-200 ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
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