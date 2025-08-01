/**
 * Tasks Content Component
 * 
 * Tasks sayfasının ana içerik alanını yöneten component.
 * Grid, List ve Kanban görünümlerini render eder.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TodoTaskDto } from '../../types/task.types';
import type { CategoryDto } from '../../types/category.types';
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Görevler yükleniyor...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Henüz görev yok
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          İlk görevinizi oluşturmak için "Yeni Görev" butonuna tıklayın.
        </p>
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
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
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
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