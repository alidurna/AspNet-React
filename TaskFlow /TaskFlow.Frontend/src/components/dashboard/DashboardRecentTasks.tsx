/**
 * DashboardRecentTasks Component
 * 
 * Dashboard sayfasının son aktiviteler ve son görevler bölümünü gösteren component.
 * Kullanıcının son eklenen, güncellenen veya tamamlanan görevlerini listeler.
 */

import React from 'react';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaPlus, FaEye } from 'react-icons/fa';

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
 * Tek bir görev item component'i
 */
interface TaskItemProps {
  task: RecentTask;
  onViewTask?: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onViewTask }) => {
  /**
   * Görev durumuna göre icon ve renk döndürür
   */
  const getStatusIcon = (status: RecentTask['status']) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <FaExclamationTriangle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <FaClock className="w-4 h-4 text-orange-500" />;
      default:
        return <FaClock className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Görev durumuna göre badge rengi döndürür
   */
  const getStatusBadge = (status: RecentTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  /**
   * Prioritye göre renk döndürür
   */
  const getPriorityColor = (priority: RecentTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  /**
   * Tarih formatı
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`p-4 border-l-4 ${getPriorityColor(task.priority)} bg-white dark:bg-gray-800 rounded-r-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h4>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(task.status)}`}>
              {task.status === 'completed' ? 'Tamamlandı' :
               task.status === 'overdue' ? 'Vadesi Geçti' :
               task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
            </span>
            
            {task.categoryName && (
              <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                {task.categoryName}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(task.updatedAt)}</span>
            {task.dueDate && (
              <span>
                Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        {onViewTask && (
          <button
            onClick={() => onViewTask(task.id)}
            className="ml-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Görevi görüntüle"
          >
            <FaEye className="w-4 h-4" />
          </button>
        )}
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Son Aktiviteler
          </h3>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Son Aktiviteler
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Son güncellenen ve eklenen görevleriniz
          </p>
        </div>
        
        {onViewAllTasks && (
          <button
            onClick={onViewAllTasks}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Tümünü Gör
            <FaEye className="w-3 h-3" />
          </button>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onViewTask={onViewTask}
            />
          ))}
          
          {tasks.length > 5 && (
            <div className="pt-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ve {tasks.length - 5} görev daha...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Henüz son aktivite yok
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Görev oluşturup düzenlemeye başlayın
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <FaPlus className="w-4 h-4" />
            İlk Görevinizi Oluşturun
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardRecentTasks; 