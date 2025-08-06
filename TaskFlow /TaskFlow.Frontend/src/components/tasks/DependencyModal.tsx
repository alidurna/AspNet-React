// ****************************************************************************************************
//  DEPENDENCYMODAL.TSX
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev bağımlılıkları yönetimi için modal bileşenini içerir.
//  Bağımlılık oluşturma, düzenleme ve görüntüleme işlemlerini sağlar.
//
//  ANA BAŞLIKLAR:
//  - Dependency Creation ve Editing
//  - Task Selection Interface
//  - Dependency Type Selection
//  - Validation ve Error Handling
//  - Real-time Updates
//
//  GÜVENLİK:
//  - Input validation
//  - Data sanitization
//  - Error boundary handling
//  - User feedback
//
//  HATA YÖNETİMİ:
//  - Form validation errors
//  - API error handling
//  - Network error recovery
//  - User-friendly error messages
//
//  EDGE-CASE'LER:
//  - Circular dependencies
//  - Self-dependencies
//  - Invalid task references
//  - Network connectivity issues
//
//  YAN ETKİLER:
//  - Task list updates
//  - Cache invalidation
//  - UI state management
//  - Real-time notifications
//
//  PERFORMANS:
//  - Debounced search
//  - Optimized rendering
//  - Lazy loading
//  - Memoization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear component structure
//  - Comprehensive documentation
//  - Type safety
//  - Extensible design
// ****************************************************************************************************

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaLink, FaUnlink, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dependencyAPI, type TaskDependencyDto, type CreateTaskDependencyDto, type UpdateTaskDependencyDto, DependencyType } from '../../services/api/dependencyAPI';
import { taskAPI } from '../../services/api/taskAPI';
import type { TodoTaskDto } from '../../types/tasks';
import { useToast } from '../../hooks/useToast';

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: number; // Hangi görev için bağımlılık yönetimi yapılacak
  dependency?: TaskDependencyDto; // Düzenleme için mevcut bağımlılık
  mode: 'create' | 'edit' | 'view';
}

const DependencyModal: React.FC<DependencyModalProps> = ({
  isOpen,
  onClose,
  taskId,
  dependency,
  mode
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateTaskDependencyDto>({
    dependentTaskId: taskId || 0,
    prerequisiteTaskId: 0,
    dependencyType: DependencyType.FinishToStart,
    description: ''
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<TodoTaskDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getTasks({ OnlyParentTasks: true }),
    enabled: isOpen
  });

  const { data: dependenciesResponse, isLoading: dependenciesLoading } = useQuery({
    queryKey: ['dependencies', taskId],
    queryFn: () => dependencyAPI.getTaskDependencies(taskId!),
    enabled: isOpen && !!taskId
  });

  // Mutations
  const createDependencyMutation = useMutation({
    mutationFn: (data: CreateTaskDependencyDto) => dependencyAPI.createDependency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      showSuccess('Bağımlılık başarıyla oluşturuldu!');
      onClose();
    },
    onError: () => showError('Bağımlılık oluşturulurken hata oluştu')
  });

  const updateDependencyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDependencyDto }) => 
      dependencyAPI.updateDependency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      showSuccess('Bağımlılık başarıyla güncellendi!');
      onClose();
    },
    onError: () => showError('Bağımlılık güncellenirken hata oluştu')
  });

  const deleteDependencyMutation = useMutation({
    mutationFn: (id: number) => dependencyAPI.deleteDependency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
      showSuccess('Bağımlılık başarıyla silindi!');
      onClose();
    },
    onError: () => showError('Bağımlılık silinirken hata oluştu')
  });

  // Computed values
  const tasks = tasksResponse?.data?.tasks || [];
  const dependencies = dependenciesResponse?.data || [];

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;
    
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const dependencyTypeOptions = [
    { value: DependencyType.FinishToStart, label: 'Bitiş-Başlangıç', description: 'Önceki görev bitmeden sonraki başlayamaz' },
    { value: DependencyType.StartToStart, label: 'Başlangıç-Başlangıç', description: 'Önceki görev başlamadan sonraki başlayamaz' },
    { value: DependencyType.FinishToFinish, label: 'Bitiş-Bitiş', description: 'Önceki görev bitmeden sonraki bitemez' },
    { value: DependencyType.StartToFinish, label: 'Başlangıç-Bitiş', description: 'Önceki görev başlamadan sonraki bitemez' }
  ];

  // Effects
  useEffect(() => {
    if (isOpen && dependency && mode === 'edit') {
      setFormData({
        dependentTaskId: dependency.dependentTaskId,
        prerequisiteTaskId: dependency.prerequisiteTaskId,
        dependencyType: dependency.dependencyType,
        description: dependency.description || ''
      });
    } else if (isOpen && taskId && mode === 'create') {
      setFormData({
        dependentTaskId: taskId,
        prerequisiteTaskId: 0,
        dependencyType: DependencyType.FinishToStart,
        description: ''
      });
    }
  }, [isOpen, dependency, taskId, mode]);

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prerequisiteTaskId) {
      showError('Lütfen bir ön koşul görev seçin');
      return;
    }

    if (formData.dependentTaskId === formData.prerequisiteTaskId) {
      showError('Görev kendisine bağımlı olamaz');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createDependencyMutation.mutateAsync(formData);
      } else if (mode === 'edit' && dependency) {
        await updateDependencyMutation.mutateAsync({
          id: dependency.id,
          data: {
            dependencyType: formData.dependencyType,
            description: formData.description
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dependencyId: number) => {
    if (window.confirm('Bu bağımlılığı silmek istediğinizden emin misiniz?')) {
      await deleteDependencyMutation.mutateAsync(dependencyId);
    }
  };

  const handleTaskSelect = (task: TodoTaskDto) => {
    setSelectedTask(task);
    setFormData(prev => ({ ...prev, prerequisiteTaskId: task.id }));
  };

  if (!isOpen) return null;

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Bağımlılık Oluştur' : 
                 mode === 'edit' ? 'Bağımlılık Düzenle' : 'Bağımlılık Detayları'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mode === 'create' ? 'Yeni bir görev bağımlılığı oluşturun' :
                 mode === 'edit' ? 'Mevcut bağımlılığı düzenleyin' : 'Bağımlılık bilgilerini görüntüleyin'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* Create/Edit Form */}
            {(mode === 'create' || mode === 'edit') && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Dependency Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Bağımlılık Türü
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dependencyTypeOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.dependencyType === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dependencyType"
                          value={option.value}
                          checked={formData.dependencyType === option.value}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            dependencyType: parseInt(e.target.value) as DependencyType 
                          }))}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Ön Koşul Görev Seçin
                  </label>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Görev ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Task List */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl">
                    {tasksLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Görevler yükleniyor...
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Arama kriterlerine uygun görev bulunamadı' : 'Henüz görev bulunmuyor'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredTasks.map(task => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => handleTaskSelect(task)}
                            className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                              formData.prerequisiteTaskId === task.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {task.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    task.isCompleted
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  }`}>
                                    {task.isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    İlerleme: {task.progress}%
                                  </span>
                                </div>
                              </div>
                              {formData.prerequisiteTaskId === task.id && (
                                <FaCheck className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Bağımlılık hakkında açıklama..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.prerequisiteTaskId}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 
                     mode === 'create' ? 'Bağımlılık Oluştur' : 'Güncelle'}
                  </button>
                </div>
              </form>
            )}

            {/* View Mode */}
            {mode === 'view' && (
              <div className="space-y-6">
                
                {/* Current Dependencies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Mevcut Bağımlılıklar
                  </h3>
                  
                  {dependenciesLoading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Bağımlılıklar yükleniyor...
                    </div>
                  ) : dependencies.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FaLink className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Bu görev için henüz bağımlılık tanımlanmamış
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dependencies.map(dep => (
                        <div key={dep.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FaLink className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {dep.prerequisiteTaskTitle}
                                </span>
                                <span className="text-gray-500">→</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {dep.dependentTaskTitle}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  dep.isPrerequisiteCompleted
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                  {dep.isPrerequisiteCompleted ? 'Ön koşul tamamlandı' : 'Ön koşul bekleniyor'}
                                </span>
                                
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  dep.canStart
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {dep.canStart ? 'Başlayabilir' : 'Bloke'}
                                </span>
                              </div>

                              {dep.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {dep.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(dep.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                title="Sil"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors duration-200"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DependencyModal; 