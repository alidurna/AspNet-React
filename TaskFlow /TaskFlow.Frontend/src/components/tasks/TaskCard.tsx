/**
 * TaskCard Component - Yeni Tasarım
 * 
 * Görev kartlarını render eden modern component.
 */

import React, { useState } from 'react';
import { FaCheck, FaEdit, FaTrash, FaCalendarAlt, FaEllipsisH, FaListUl, FaPlus, FaEye, FaLink, FaUnlink } from 'react-icons/fa';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';

interface TaskCardProps {
  task: TodoTaskDto;
  categories: CategoryDto[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: (isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
  onViewSubTasks?: (taskId: number) => void;
  onAddSubTask?: (taskId: number) => void;
  onViewDependencies?: (taskId: number) => void;
  onAddDependency?: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categories,
  onEdit,
  onDelete,
  onToggleComplete,
  onProgressChange,
  onViewSubTasks,
  onAddSubTask,
  onViewDependencies,
  onAddDependency,
}) => {
  const [showActions, setShowActions] = useState(false);

  // Progress durumuna göre buton ve metin belirleme - Soft renkler
  const getProgressInfo = () => {
    if (task.isCompleted) {
      return { text: 'Tamamlandı', color: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200', icon: '✅' };
    } else if (task.progress >= 75) {
      return { text: 'Neredeyse Tamam', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200', icon: '🔄' };
    } else if (task.progress >= 50) {
      return { text: 'Yarısı Bitti', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-200', icon: '⏳' };
    } else if (task.progress >= 25) {
      return { text: 'Başladı', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200', icon: '🚀' };
    } else {
      return { text: 'Başla', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200', icon: '▶️' };
    }
  };

  const progressInfo = getProgressInfo();

  const handleProgressClick = () => {
    let newProgress = 0;
    
    if (task.progress < 25) {
      newProgress = 25; // Başladı
    } else if (task.progress < 50) {
      newProgress = 50; // Yarısı bitti
    } else if (task.progress < 75) {
      newProgress = 75; // Neredeyse tamam
    } else if (task.progress < 100) {
      newProgress = 100; // Tamamlandı
    } else {
      newProgress = 0; // Başa dön
    }
    
    onProgressChange(task.id, newProgress);
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseInt(e.target.value);
    onProgressChange(task.id, progress);
  };

  // Alt görev sayısını hesapla
  const subTasksCount = task.subTasks?.length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
      
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => onToggleComplete(!task.isCompleted)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                task.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {task.isCompleted && <FaCheck className="w-3 h-3" />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold mb-1 ${
                task.isCompleted 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm ${
                  task.isCompleted 
                    ? 'text-gray-400 dark:text-gray-500 line-through' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <FaEllipsisH className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-10">
                {onViewSubTasks && (
                  <button
                    onClick={() => {
                      onViewSubTasks(task.id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                  >
                    <FaEye className="w-4 h-4" />
                    Alt Görevleri Görüntüle ({subTasksCount})
                  </button>
                )}
                {onAddSubTask && (
                  <button
                    onClick={() => {
                      onAddSubTask(task.id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                  >
                    <FaPlus className="w-4 h-4" />
                    Alt Görev Ekle
                  </button>
                )}
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <FaEdit className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <FaTrash className="w-4 h-4" />
                  Sil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {task.categoryId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200">
                {categories.find(c => c.id === task.categoryId)?.name}
              </span>
            )}
            {/* Alt Görev Sayısı Badge */}
            {subTasksCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200">
                <FaListUl className="w-3 h-3 mr-1" />
                {subTasksCount} alt görev
              </span>
            )}
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
              <FaCalendarAlt className="w-3.5 h-3.5" />
              {new Date(task.dueDate).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>

        {/* Alt Görev ve Bağımlılık Butonları */}
        <div className="space-y-3 mb-4">
          {/* Alt Görev Butonları */}
          <div className="flex gap-2">
            {onViewSubTasks && (
              <button
                onClick={() => onViewSubTasks(task.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 border border-purple-300 rounded-lg font-medium transition-all duration-200"
              >
                <FaEye className="w-4 h-4" />
                <span className="text-sm">Alt Görevleri Görüntüle</span>
              </button>
            )}
            {onAddSubTask && (
              <button
                onClick={() => onAddSubTask(task.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 border border-green-300 rounded-lg font-medium transition-all duration-200"
              >
                <FaPlus className="w-4 h-4" />
                <span className="text-sm">Alt Görev Ekle</span>
              </button>
            )}
          </div>

          {/* Bağımlılık Butonları */}
          <div className="flex gap-2">
            {onViewDependencies && (
              <button
                onClick={() => onViewDependencies(task.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 border border-blue-300 rounded-lg font-medium transition-all duration-200"
              >
                <FaLink className="w-4 h-4" />
                <span className="text-sm">Bağımlılıkları Görüntüle</span>
              </button>
            )}
            {onAddDependency && (
              <button
                onClick={() => onAddDependency(task.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-700 border border-indigo-300 rounded-lg font-medium transition-all duration-200"
              >
                <FaUnlink className="w-4 h-4" />
                <span className="text-sm">Bağımlılık Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                İlerleme
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {task.progress}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={task.progress}
                onChange={handleProgressBarChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${task.progress}%, #e5e7eb ${task.progress}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Progress Button */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Durum
            </span>
            <button
              onClick={handleProgressClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${progressInfo.color}`}
            >
              <span className="text-sm">{progressInfo.icon}</span>
              <span className="text-sm">{progressInfo.text}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 