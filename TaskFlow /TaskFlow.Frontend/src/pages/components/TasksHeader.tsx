/**
 * Tasks Header Component
 * 
 * Tasks sayfasının header kısmını yöneten component.
 * View mode toggle, search ve filter butonları içerir.
 */

import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-8 mb-8"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full" />
      
      <div className="relative z-10">
        {/* Header Title and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Görevlerim
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {tasksCount} görev
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {completedCount} tamamlandı
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={onCreateTask}
              className="mt-6 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Yeni Görev
            </Button>
          </motion.div>
        </div>

        {/* Search and Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Enhanced Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Görevlerde ara... (başlık, açıklama)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Enhanced View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl p-1.5 shadow-sm border border-gray-200/60 dark:border-gray-600/60">
              {[
                { mode: 'grid', icon: FaTh, title: 'Grid Görünümü' },
                { mode: 'list', icon: FaList, title: 'Liste Görünümü' },
                { mode: 'kanban', icon: FaColumns, title: 'Kanban Görünümü' }
              ].map(({ mode, icon: Icon, title }) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange(mode as 'grid' | 'list' | 'kanban')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title={title}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* Enhanced Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFilters}
              className={`p-3 rounded-xl border transition-all duration-200 shadow-sm ${
                showFilters
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300/60 dark:border-gray-600/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:shadow-md'
              }`}
              title="Filtreleri Göster/Gizle"
            >
              <FaFilter className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TasksHeader; 