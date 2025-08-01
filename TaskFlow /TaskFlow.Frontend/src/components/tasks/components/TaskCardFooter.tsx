/**
 * Task Card Footer Component
 * 
 * Task kartının footer kısmını render eden component.
 * Category, due date ve progress slider içerir.
 */

import React from 'react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaUser, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { CategoryDto } from '../../../types/category.types';
import ProgressSlider from '../ProgressSlider';

interface TaskCardFooterProps {
  categoryId: number;
  categories: CategoryDto[];
  dueDate?: string;
  progress?: number;
  isCompleted: boolean;
  onProgressChange: (progress: number) => void;
  compact?: boolean;
}

/**
 * Date formatting utility
 */
const formatDate = (dateString: string): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } => {
  const date = parseISO(dateString);
  const now = new Date();
  
  if (isToday(date)) {
    return {
      text: 'Bugün',
      isOverdue: false,
      isToday: true,
      isTomorrow: false
    };
  }
  
  if (isTomorrow(date)) {
    return {
      text: 'Yarın',
      isOverdue: false,
      isToday: false,
      isTomorrow: true
    };
  }
  
  if (isPast(date) && !isToday(date)) {
    return {
      text: format(date, 'dd MMM', { locale: tr }),
      isOverdue: true,
      isToday: false,
      isTomorrow: false
    };
  }
  
  return {
    text: format(date, 'dd MMM', { locale: tr }),
    isOverdue: false,
    isToday: false,
    isTomorrow: false
  };
};

/**
 * Category name getter
 */
const getCategoryName = (categoryId: number, categories: CategoryDto[]): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.name || 'Kategori Yok';
};

/**
 * TaskCardFooter Component
 */
const TaskCardFooter: React.FC<TaskCardFooterProps> = ({
  categoryId,
  categories,
  dueDate,
  progress = 0,
  isCompleted,
  onProgressChange,
  compact = false,
}) => {
  const dueDateInfo = dueDate ? formatDate(dueDate) : null;

  return (
    <>
      {/* Progress Slider */}
      {!compact && (
        <div className="mb-3">
          <ProgressSlider
            currentProgress={Number(progress)}
            onProgressChange={onProgressChange}
            isCompleted={isCompleted}
            compact={true}
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaUser className="w-3 h-3" />
          {getCategoryName(categoryId, categories)}
        </span>

        {dueDateInfo && (
          <span className={`flex items-center gap-1 ${
            dueDateInfo.isOverdue ? 'text-red-500' : 
            dueDateInfo.isToday ? 'text-orange-500' : 
            dueDateInfo.isTomorrow ? 'text-blue-500' : 'text-gray-500'
          }`}>
            {dueDateInfo.isOverdue && <FaExclamationTriangle className="w-3 h-3" />}
            {dueDateInfo.isToday && <FaCheckCircle className="w-3 h-3" />}
            {!dueDateInfo.isOverdue && !dueDateInfo.isToday && <FaClock className="w-3 h-3" />}
            {dueDateInfo.text}
          </span>
        )}
      </div>
    </>
  );
};

export default TaskCardFooter; 