/**
 * DashboardRecentTasks Component
 * 
 * Soft ve minimal tasarım için yeniden düzenlenmiş son aktiviteler.
 */

import React from 'react';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaCircle } from 'react-icons/fa';

interface RecentTask {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'overdue' | 'pending';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  updatedAt: string;
  categoryName?: string;
}

interface DashboardRecentTasksProps {
  tasks: RecentTask[];
  isLoading?: boolean;
  onViewTask?: (taskId: number) => void;
  onViewAllTasks?: () => void;
}

/**
 * Tek bir görev kartı component'i
 */
interface TaskCardProps {
  task: RecentTask;
  onViewTask?: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewTask }) => {
  /**
   * Durum renklerini belirler
   */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <FaCheckCircle className="w-3 h-3" />
        };
      case 'in_progress':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: <FaClock className="w-3 h-3" />
        };
      case 'overdue':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <FaExclamationTriangle className="w-3 h-3" />
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: <FaCircle className="w-3 h-3" />
        };
    }
  };

  /**
   * Öncelik renklerini belirler
   */
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      default:
        return 'text-green-500';
    }
  };

  /**
   * Durum metnini belirler
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'overdue':
        return 'Vadesi Geçti';
      default:
        return 'Bekliyor';
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityColor = getPriorityConfig(task.priority);
  const statusText = getStatusText(task.status);

  return (
    <div 
      className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} hover:shadow-sm transition-all duration-200 cursor-pointer`}
      onClick={() => onViewTask?.(task.id)}
    >
      <div className="flex items-start gap-3">
        {/* Durum İkonu */}
        <div className={`w-6 h-6 ${statusConfig.color} flex items-center justify-center flex-shrink-0`}>
          {statusConfig.icon}
        </div>

        {/* Görev Detayları */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h4>
            <div className={`w-2 h-2 rounded-full ${priorityColor} flex-shrink-0 ml-2`} />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusText}
            </span>
            
            {task.categoryName && (
              <span className="text-gray-500 dark:text-gray-500">
                {task.categoryName}
              </span>
            )}
          </div>

          {/* Tarih Bilgisi */}
          {task.dueDate && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Ana DashboardRecentTasks component'i
 */
const DashboardRecentTasks: React.FC<DashboardRecentTasksProps> = ({
  tasks,
  isLoading = false,
  onViewTask,
  onViewAllTasks
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Görev Listesi */}
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onViewTask={onViewTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Henüz hiç göreviniz yok
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            İlk görevinizi oluşturarak başlayın!
          </p>
        </div>
      )}

      {/* Tümünü Görüntüle Butonu */}
      {tasks.length > 0 && onViewAllTasks && (
        <button
          onClick={onViewAllTasks}
          className="w-full mt-4 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Tüm Görevleri Görüntüle
        </button>
      )}
    </div>
  );
};

export default DashboardRecentTasks; 