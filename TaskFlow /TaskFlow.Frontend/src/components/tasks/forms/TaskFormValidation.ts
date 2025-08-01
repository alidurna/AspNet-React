/**
 * Task Form Validation Utilities
 * 
 * Task form validation logic'ini içeren utility functions.
 */

export interface TaskFormData {
  title: string;
  description: string;
  categoryId: number;
  priority: number;
  dueDate: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Task form validation
 */
export const validateTaskForm = (formData: TaskFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Title validation
  if (!formData.title.trim()) {
    errors.title = 'Görev başlığı gereklidir';
  } else if (formData.title.length < 3) {
    errors.title = 'Görev başlığı en az 3 karakter olmalıdır';
  } else if (formData.title.length > 200) {
    errors.title = 'Görev başlığı 200 karakterden uzun olamaz';
  }

  // Description validation
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'Açıklama 1000 karakterden uzun olamaz';
  }

  // Category validation
  if (!formData.categoryId || formData.categoryId <= 0) {
    errors.categoryId = 'Geçerli bir kategori seçiniz';
  }

  // Priority validation
  if (!formData.priority || formData.priority < 1 || formData.priority > 4) {
    errors.priority = 'Geçerli bir öncelik seçiniz';
  }

  // Due date validation
  if (formData.dueDate) {
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.dueDate = 'Bitiş tarihi bugünden önce olamaz';
    }
  }

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Clear specific field error
 */
export const clearFieldError = (errors: ValidationErrors, field: string): ValidationErrors => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};

/**
 * Format form data for submission
 */
export const formatTaskFormData = (formData: TaskFormData) => {
  return {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    categoryId: formData.categoryId,
    priority: formData.priority,
    dueDate: formData.dueDate || undefined,
  };
}; 