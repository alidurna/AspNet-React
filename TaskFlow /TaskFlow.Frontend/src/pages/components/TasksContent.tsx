/**
 * TasksContent Component - Yeni Tasarım
 * 
 * Görevler sayfasının ana içerik alanı.
 */

import React, { useMemo } from 'react';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';
import TaskCard from '../../components/tasks/TaskCard';
import KanbanBoard from '../../components/tasks/KanbanBoard';

interface TasksContentProps {
  tasks: TodoTaskDto[];
  categories: CategoryDto[];
  isLoading: boolean;
  viewMode: 'grid' | 'list' | 'kanban';
  searchTerm: string;
  selectedCategory: number | null;
  selectedPriority: number | null;
  selectedStatus: 'all' | 'completed' | 'pending';
  onEditTask: (task: TodoTaskDto) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
  onViewSubTasks?: (taskId: number) => void;
  onAddSubTask?: (taskId: number) => void;
  onViewDependencies?: (taskId: number) => void;
  onAddDependency?: (taskId: number) => void;
}

const TasksContent: React.FC<TasksContentProps> = ({
  tasks,
  categories,
  isLoading,
  viewMode,
  searchTerm,
  selectedCategory,
  selectedPriority,
  selectedStatus,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onProgressChange,
  onViewSubTasks,
  onAddSubTask,
  onViewDependencies,
  onAddDependency,
}) => {
  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Sadece ana görevleri göster (alt görevler değil)
      if (task.parentTaskId) {
        return false;
      }

      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && task.categoryId !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority && task.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'completed' && !task.isCompleted) {
        return false;
      }
      if (selectedStatus === 'pending' && task.isCompleted) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 absolute top-0 left-0"></div>
        </div>
        <span className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Görevler yükleniyor...
        </span>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-16 mx-auto max-w-lg shadow-xl">
          <div className="text-blue-400 dark:text-blue-500 mb-8">
            <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {searchTerm || selectedCategory || selectedPriority || selectedStatus !== 'all'
              ? 'Filtrelere uygun görev bulunamadı'
              : 'Henüz görev yok'}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {searchTerm || selectedCategory || selectedPriority || selectedStatus !== 'all'
              ? 'Filtreleri değiştirerek daha fazla görev görebilirsiniz.'
              : 'İlk görevinizi oluşturmak için "Yeni Görev" butonuna tıklayın.'}
          </p>
        </div>
      </div>
    );
  }

  // Kanban View
  if (viewMode === 'kanban') {
    return (
      <KanbanBoard
        tasks={filteredTasks}
        categories={categories}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleComplete={onToggleComplete}
        onProgressChange={onProgressChange}
      />
    );
  }

  // Grid and List View
  const gridCols = viewMode === 'grid'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1';

  return (
    <div className={`grid ${gridCols} gap-6 py-6`}>
      {filteredTasks.map((task) => (
        <div key={task.id} className="h-full">
          <TaskCard
            task={task}
            categories={categories}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
            onToggleComplete={(isCompleted) => onToggleComplete(task.id, isCompleted)}
            onProgressChange={onProgressChange}
            onViewSubTasks={onViewSubTasks}
            onAddSubTask={onAddSubTask}
            onViewDependencies={onViewDependencies}
            onAddDependency={onAddDependency}
          />
        </div>
      ))}
    </div>
  );
};

export default TasksContent; 