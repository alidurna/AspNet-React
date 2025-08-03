/**
 * TaskCard Component - Refactored
 * 
 * Görev kartlarını render eden bağımsız component.
 * Grid, List ve Kanban görünümlerini destekler.
 * Modüler sub-components kullanır.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';

// Sub-components
import TaskCardHeader from './components/TaskCardHeader';
import TaskCardContent from './components/TaskCardContent';
import TaskCardFooter from './components/TaskCardFooter';

interface TaskCardProps {
  task: TodoTaskDto;
  viewMode: 'grid' | 'list' | 'kanban';
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: (isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
  categories: CategoryDto[];
}

/**
 * TaskCard Component - Refactored
 */
const TaskCard: React.FC<TaskCardProps> = ({
  task,
  viewMode,
  onEdit,
  onDelete,
  onToggleComplete,
  onProgressChange,
  categories
}) => {
  /**
   * Progress değişikliğini handle eder
   */
  const handleProgressChange = (progress: number) => {
    onProgressChange(task.id, progress);
  };

  /**
   * Base card wrapper with enhanced modern animation and styling
   */
  const CardWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-white via-white to-gray-50/30
        dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/30
        backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 
        rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-500/10
        transition-all duration-300 ease-out
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
        ${task.isCompleted ? 'opacity-75 grayscale-[0.3]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Priority indicator bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        task.priority === 1 ? 'bg-gradient-to-r from-red-400 to-red-600' :
        task.priority === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
        task.priority === 3 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
        'bg-gradient-to-r from-gray-300 to-gray-400'
      }`} />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );

  // Grid View
  if (viewMode === 'grid') {
    return (
      <CardWrapper className="p-6 h-full flex flex-col">
        <TaskCardHeader
          isCompleted={task.isCompleted}
          priority={task.priority}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <div className="flex-1 mb-4">
          <TaskCardContent
            title={task.title}
            description={task.description}
            isCompleted={task.isCompleted}
          />
        </div>

        <TaskCardFooter
          categoryId={task.categoryId}
          categories={categories}
          dueDate={task.dueDate}
          progress={task.progress ?? 0}
          isCompleted={task.isCompleted}
          onProgressChange={handleProgressChange}
          compact={false}
        />
      </CardWrapper>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <CardWrapper className="p-5 mb-3">
        <div className="flex items-center gap-6">
          {/* Left - Enhanced Checkbox and Content */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleComplete(!task.isCompleted)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm ${
                task.isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-green-600 border-green-500 text-white shadow-green-200'
                  : 'border-gray-300 hover:border-green-400 hover:shadow-md bg-white dark:bg-gray-800'
              }`}
            >
              {task.isCompleted && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg text-gray-900 dark:text-white truncate transition-all duration-200 ${
                task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Center - Enhanced Progress */}
          <div className="w-32 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                İlerleme
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {task.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${task.progress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full shadow-sm"
              />
            </div>
          </div>

          {/* Right - Enhanced Category and Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {categories.find(cat => cat.id === task.categoryId)?.name || 'Kategori Yok'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 group"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">✏️</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 group"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">🗑️</span>
              </motion.button>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Kanban View
  if (viewMode === 'kanban') {
    return (
      <CardWrapper className="p-4 mb-4 hover:rotate-1 hover:scale-105">
        <TaskCardHeader
          isCompleted={task.isCompleted}
          priority={task.priority}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <div className="mb-3">
          <TaskCardContent
            title={task.title}
            description={task.description}
            isCompleted={task.isCompleted}
          />
        </div>

        <TaskCardFooter
          categoryId={task.categoryId}
          categories={categories}
          dueDate={task.dueDate}
          progress={task.progress ?? 0}
          isCompleted={task.isCompleted}
          onProgressChange={handleProgressChange}
          compact={true}
        />
      </CardWrapper>
    );
  }

  return null;
};

export default TaskCard; 