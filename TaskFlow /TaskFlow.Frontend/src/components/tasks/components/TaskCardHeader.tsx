/**
 * Task Card Header Component
 * 
 * Task kartının header kısmını render eden component.
 * Checkbox, priority ve actions menu içerir.
 */

import React from 'react';
import { FaFlag, FaEllipsisV, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';

interface TaskCardHeaderProps {
  isCompleted: boolean;
  priority?: number;
  onToggleComplete: (isCompleted: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Priority utility functions
 */
const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1: return 'text-red-500 border-red-200';
    case 2: return 'text-orange-500 border-orange-200';
    case 3: return 'text-blue-500 border-blue-200';
    case 4: return 'text-gray-500 border-gray-200';
    default: return 'text-gray-500 border-gray-200';
  }
};

const getPriorityText = (priority: number): string => {
  switch (priority) {
    case 1: return 'Yüksek';
    case 2: return 'Orta';
    case 3: return 'Düşük';
    case 4: return 'En Düşük';
    default: return 'Belirsiz';
  }
};

/**
 * TaskCardHeader Component
 */
const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  isCompleted,
  priority,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-start justify-between mb-3">
      {/* Left side - Checkbox and Priority */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleComplete(!isCompleted)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isCompleted && <FaCheck className="w-3 h-3" />}
        </button>
        
        {priority && (
          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(priority)}`}>
            <FaFlag className="w-3 h-3 inline mr-1" />
            {getPriorityText(priority)}
          </span>
        )}
      </div>

      {/* Right side - Actions Menu */}
      <div className="relative group">
        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FaEllipsisV className="w-3 h-3 text-gray-400" />
        </button>
        
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <button
            onClick={onEdit}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <FaEdit className="w-3 h-3" />
            Düzenle
          </button>
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2"
          >
            <FaTrash className="w-3 h-3" />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCardHeader; 