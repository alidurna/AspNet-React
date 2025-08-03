/**
 * Tasks Content Component
 * 
 * Tasks sayfasının ana içerik alanını yöneten component.
 * Grid, List ve Kanban görünümlerini render eder.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';
import TaskCard from '../../components/tasks/TaskCard';
import KanbanBoard from '../../components/tasks/KanbanBoard';

interface TasksContentProps {
  tasks: TodoTaskDto[];
  categories: CategoryDto[];
  viewMode: 'grid' | 'list' | 'kanban';
  isLoading: boolean;
  onEditTask: (task: TodoTaskDto) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
}

/**
 * TasksContent Component
 */
const TasksContent: React.FC<TasksContentProps> = ({
  tasks,
  categories,
  viewMode,
  isLoading,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onProgressChange,
}) => {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 absolute top-0 left-0"></div>
        </div>
        <span className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
          Görevler yükleniyor...
        </span>
        <div className="mt-2 flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </motion.div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mx-auto max-w-md">
          <div className="text-blue-400 dark:text-blue-500 mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Henüz görev yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            İlk görevinizi oluşturmak için "Yeni Görev" butonuna tıklayın ve üretkenlik yolculuğunuza başlayın.
          </p>
          <div className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
            <span>💡 İpucu: Görevlerinizi kategorilere ayırarak daha organize olabilirsiniz</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Kanban View
  if (viewMode === 'kanban') {
    return (
      <KanbanBoard
        tasks={tasks}
        categories={categories}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
        onProgressChange={onProgressChange}
      />
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -20,
                transition: { duration: 0.2 }
              }}
              whileHover={{ 
                zIndex: 10
              }}
              className="h-full"
            >
              <TaskCard
                task={task}
                viewMode="grid"
                categories={categories}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                onToggleComplete={(isCompleted) => onToggleComplete(task.id, isCompleted)}
                onProgressChange={onProgressChange}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              transition: { 
                delay: index * 0.03,
                duration: 0.3,
                ease: "easeOut"
              }
            }}
            exit={{ 
              opacity: 0, 
              x: -30, 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            whileHover={{ 
              x: 4,
              transition: { duration: 0.2 }
            }}
          >
            <TaskCard
              task={task}
              viewMode="list"
              categories={categories}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onToggleComplete={(isCompleted) => onToggleComplete(task.id, isCompleted)}
              onProgressChange={onProgressChange}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TasksContent; 