/**
 * KanbanBoard Component - Yeni Tasarım
 * 
 * Kanban board görünümü için component.
 */

import React from 'react';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: TodoTaskDto[];
  categories: CategoryDto[];
  onEditTask: (task: TodoTaskDto) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  categories,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onProgressChange,
}) => {
  const columns = [
    {
      id: 'pending',
      title: 'Bekleyen',
      tasks: tasks.filter(task => !task.isCompleted && task.progress < 50),
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'in-progress',
      title: 'Devam Eden',
      tasks: tasks.filter(task => !task.isCompleted && task.progress >= 50 && task.progress < 100),
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'completed',
      title: 'Tamamlanan',
      tasks: tasks.filter(task => task.isCompleted || task.progress === 100),
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`rounded-xl border p-4 ${column.color}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {column.tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <TaskCard
                  task={task}
                  categories={categories}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onToggleComplete={(isCompleted) => onToggleComplete(task.id, isCompleted)}
                  onProgressChange={onProgressChange}
                />
              </div>
            ))}
            
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Henüz görev yok</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard; 