/**
 * TaskModal Component - Refactored
 * 
 * Görev ekleme ve düzenleme işlemleri için modal component.
 * Modüler sub-components kullanır.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave } from 'react-icons/fa';
import type { TodoTaskDto, CreateTodoTaskDto, UpdateTodoTaskDto } from '../../types/task.types';
import type { CategoryDto } from '../../types/category.types';

// Sub-components
import TaskFormFields from './forms/TaskFormFields';
import { 
  validateTaskForm, 
  formatTaskFormData, 
  hasValidationErrors,
  clearFieldError,
  type TaskFormData,
  type ValidationErrors 
} from './forms/TaskFormValidation';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTodoTaskDto | UpdateTodoTaskDto) => void;
  task: TodoTaskDto | null;
  categories: CategoryDto[];
  isLoading?: boolean;
}

/**
 * TaskModal Component - Refactored
 */
const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  categories,
  isLoading = false
}) => {
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    categoryId: categories[0]?.id || 1,
    priority: 2,
    dueDate: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Initialize form data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        categoryId: task.categoryId,
        priority: Number(task.priority ?? 2),
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id ?? 1,
        priority: 2,
        dueDate: ''
      });
    }
    setErrors({});
  }, [task, categories, isOpen]);

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error if exists
    if (errors[field]) {
      setErrors(prev => clearFieldError(prev, field));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateTaskForm(formData);
    
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    // Format and submit data
    const formattedData = formatTaskFormData(formData);
    onSubmit(formattedData);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              <TaskFormFields
                formData={formData}
                categories={categories}
                errors={errors}
                onInputChange={handleInputChange}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {task ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal; 