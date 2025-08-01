/**
 * TaskCard Component - Refactored
 * 
 * Görev kartlarını render eden bağımsız component.
 * Grid, List ve Kanban görünümlerini destekler.
 * Modüler sub-components kullanır.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { TodoTaskDto } from '../../types/task.types';
import type { CategoryDto } from '../../types/category.types';

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
   * Base card wrapper with animation
   */
  const CardWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
        task.isCompleted ? 'opacity-75' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );

  // Grid View
  if (viewMode === 'grid') {
    return (
      <CardWrapper className="p-4">
        <TaskCardHeader
          isCompleted={task.isCompleted}
          priority={task.priority}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <TaskCardContent
          title={task.title}
          description={task.description}
          isCompleted={task.isCompleted}
        />

        <TaskCardFooter
          categoryId={task.categoryId}
          categories={categories}
          dueDate={task.dueDate}
          progress={task.progress || 0}
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
      <CardWrapper className="p-3">
        <div className="flex items-center gap-4">
          {/* Left - Checkbox and Content */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => onToggleComplete(!task.isCompleted)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                task.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.isCompleted && <span className="text-xs">✓</span>}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-900 dark:text-white truncate ${
                task.isCompleted ? 'line-through text-gray-500' : ''
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Center - Progress */}
          <div className="w-24 flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">
              {task.progress || 0}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Right - Category and Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 min-w-0 truncate">
              {categories.find(cat => cat.id === task.categoryId)?.name || 'Kategori Yok'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs">✏️</span>
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
              >
                <span className="text-xs">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Kanban View
  if (viewMode === 'kanban') {
    return (
      <CardWrapper className="p-3 mb-3">
        <TaskCardHeader
          isCompleted={task.isCompleted}
          priority={task.priority}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <TaskCardContent
          title={task.title}
          description={task.description}
          isCompleted={task.isCompleted}
        />

        <TaskCardFooter
          categoryId={task.categoryId}
          categories={categories}
          dueDate={task.dueDate}
          progress={task.progress || 0}
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