/**
 * Task Card Content Component
 * 
 * Task kartının içerik kısmını render eden component.
 * Title ve description içerir.
 */

import React from 'react';

interface TaskCardContentProps {
  title: string;
  description?: string;
  isCompleted: boolean;
}

/**
 * TaskCardContent Component
 */
const TaskCardContent: React.FC<TaskCardContentProps> = ({
  title,
  description,
  isCompleted,
}) => {
  return (
    <>
      {/* Title */}
      <h3 className={`font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 ${
        isCompleted ? 'line-through text-gray-500' : ''
      }`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {description}
        </p>
      )}
    </>
  );
};

export default TaskCardContent; 