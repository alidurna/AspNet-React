/**
 * SubTasks Modal Component
 * 
 * Alt görevleri görüntülemek ve yönetmek için modal.
 */

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { TodoTaskDto } from '../../types/tasks';
import type { CategoryDto } from '../../types/tasks';

interface SubTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTask: TodoTaskDto;
  categories: CategoryDto[];
  onAddSubTask: (parentTaskId: number) => void;
  onEditSubTask: (subTask: TodoTaskDto) => void;
  onDeleteSubTask: (subTaskId: number) => void;
  onToggleSubTaskComplete: (subTaskId: number, isCompleted: boolean) => void;
  onSubTaskProgressChange: (subTaskId: number, progress: number) => void;
}

const SubTasksModal: React.FC<SubTasksModalProps> = ({
  isOpen,
  onClose,
  parentTask,
  categories,
  onAddSubTask,
  onEditSubTask,
  onDeleteSubTask,
  onToggleSubTaskComplete,
  onSubTaskProgressChange,
}) => {
  const queryClient = useQueryClient();

  // Alt görevleri API'den çek
  const { data: subTasksResponse, isLoading: subTasksLoading, error: subTasksError } = useQuery({
    queryKey: ['subTasks', parentTask.id],
    queryFn: () => api.getSubTasks(parentTask.id),
    enabled: isOpen && !!parentTask.id,
  });

  const subTasks = subTasksResponse?.data || [];

  // Modal açıldığında parent task'ı yeniden çek
  useEffect(() => {
    if (isOpen && parentTask) {
      // Parent task'ı yeniden çekerek güncel alt görevleri al
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['subTasks', parentTask.id] });
    }
  }, [isOpen, parentTask, queryClient]);

  // Progress durumuna göre buton ve metin belirleme - Soft renkler
  const getProgressInfo = (progress: number, isCompleted: boolean) => {
    if (isCompleted) {
      return { text: 'Tamamlandı', color: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200', icon: '✅' };
    } else if (progress >= 75) {
      return { text: 'Neredeyse Tamam', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200', icon: '🔄' };
    } else if (progress >= 50) {
      return { text: 'Yarısı Bitti', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-200', icon: '⏳' };
    } else if (progress >= 25) {
      return { text: 'Başladı', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200', icon: '🚀' };
    } else {
      return { text: 'Başla', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200', icon: '▶️' };
    }
  };

  const handleProgressClick = (subTask: TodoTaskDto) => {
    let newProgress = 0;
    
    if (subTask.progress < 25) {
      newProgress = 25; // Başladı
    } else if (subTask.progress < 50) {
      newProgress = 50; // Yarısı bitti
    } else if (subTask.progress < 75) {
      newProgress = 75; // Neredeyse tamam
    } else if (subTask.progress < 100) {
      newProgress = 100; // Tamamlandı
    } else {
      newProgress = 0; // Başa dön
    }
    
    console.log('Alt görev ilerleme değişiyor:', {
      subTaskId: subTask.id,
      oldProgress: subTask.progress,
      newProgress: newProgress
    });
    
    // API'yi çağır
    onSubTaskProgressChange(subTask.id, newProgress);
    
    // Cache'i invalidate et
    queryClient.invalidateQueries({ queryKey: ['subTasks', parentTask.id] });
  };

  const handleToggleComplete = (subTask: TodoTaskDto) => {
    const newIsCompleted = !subTask.isCompleted;
    
    console.log('Alt görev tamamlanma durumu değişiyor:', {
      subTaskId: subTask.id,
      oldIsCompleted: subTask.isCompleted,
      newIsCompleted: newIsCompleted
    });
    
    // API'yi çağır
    onToggleSubTaskComplete(subTask.id, newIsCompleted);
    
    // Cache'i invalidate et
    queryClient.invalidateQueries({ queryKey: ['subTasks', parentTask.id] });
  };

  const handleProgressBarChange = (subTask: TodoTaskDto, newProgress: number) => {
    console.log('Alt görev progress bar değişiyor:', {
      subTaskId: subTask.id,
      oldProgress: subTask.progress,
      newProgress: newProgress
    });
    
    // API'yi çağır
    onSubTaskProgressChange(subTask.id, newProgress);
    
    // Cache'i invalidate et
    queryClient.invalidateQueries({ queryKey: ['subTasks', parentTask.id] });
  };

  // Modal açık değilse hiçbir şey render etme
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-800 dark:to-purple-900">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                Alt Görevler
              </h2>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                {parentTask.title} - {subTasks.length} alt görev
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-3 text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-700 rounded-xl transition-colors duration-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {subTasksLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-600 dark:text-gray-400">Alt görevler yükleniyor...</p>
              </div>
            ) : subTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                  <FaPlus className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Henüz alt görev yok
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Bu görev için henüz alt görev oluşturulmamış.
                </p>
                <button
                  onClick={() => {
                    onAddSubTask(parentTask.id);
                    // Modal'ı kapatma - alt görev oluşturduktan sonra burada kal
                  }}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FaPlus className="w-5 h-5" />
                  İlk Alt Görevi Oluştur
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {subTasks.map((subTask) => {
                  const progressInfo = getProgressInfo(subTask.progress, subTask.isCompleted);
                  
                  return (
                    <div key={subTask.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200">

                      {/* Sub-task header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <button
                            onClick={() => handleToggleComplete(subTask)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              subTask.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                                : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            {subTask.isCompleted && <FaCheck className="w-3 h-3" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-lg font-semibold mb-2 ${
                              subTask.isCompleted
                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {subTask.title}
                            </h4>
                            {subTask.description && (
                              <p className={`text-sm leading-relaxed ${
                                subTask.isCompleted
                                  ? 'text-gray-400 dark:text-gray-500 line-through'
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}>
                                {subTask.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onEditSubTask(subTask)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            title="Düzenle"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSubTask(subTask.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            title="Sil"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-task metadata */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {subTask.categoryId && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                              {categories.find(c => c.id === subTask.categoryId)?.name}
                            </span>
                          )}
                        </div>

                        {subTask.dueDate && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                            <FaCalendarAlt className="w-3.5 h-3.5" />
                            {new Date(subTask.dueDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>

                      {/* Progress section */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            İlerleme
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {subTask.progress}%
                          </span>
                        </div>
                        <div className="mb-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={subTask.progress}
                            onChange={(e) => handleProgressBarChange(subTask, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${subTask.progress}%, #e5e7eb ${subTask.progress}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                        
                        {/* Progress Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Durum
                          </span>
                          <button
                            onClick={() => handleProgressClick(subTask)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${progressInfo.color}`}
                          >
                            <span className="text-sm">{progressInfo.icon}</span>
                            <span className="text-sm">{progressInfo.text}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubTasksModal; 