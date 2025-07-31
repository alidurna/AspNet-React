import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TodoTaskDto } from "../../types/task.types";
import type { CategoryDto } from "../../types/category.types";
import { FaCheck, FaEllipsisV, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import ProgressSlider from "./ProgressSlider";

interface KanbanBoardProps {
  tasks: TodoTaskDto[];
  categories: CategoryDto[];
  onEdit: (task: TodoTaskDto) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  categories,
  onEdit,
  onDelete,
  onToggleComplete,
  onProgressChange,
}) => {
  const columns = [
    { 
      id: "todo", 
      title: "Yapılacaklar", 
      tasks: tasks.filter(t => !t.isCompleted && t.progress === 0) 
    },
    { 
      id: "in-progress", 
      title: "Devam Eden", 
      tasks: tasks.filter(t => !t.isCompleted && t.progress > 0 && t.progress < 100) 
    },
    { 
      id: "done", 
      title: "Tamamlanan", 
      tasks: tasks.filter(t => t.isCompleted) 
    },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <motion.div
          key={column.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0 w-80"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {column.title} ({column.tasks.length})
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence>
                {column.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <button
                        onClick={() => onToggleComplete(task.id, !task.isCompleted)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                        }`}
                      >
                        {task.isCompleted && <FaCheck className="w-3 h-3" />}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <FaEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className={`font-medium mb-2 ${
                      task.isCompleted 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {task.categoryId && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
                            {categories.find(c => c.id === task.categoryId)?.name}
                          </span>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaCalendarAlt className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>

                    {/* Progress Slider for Kanban Cards */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <ProgressSlider
                        currentProgress={task.progress}
                        onProgressChange={(progress) => onProgressChange(task.id, progress)}
                        isCompleted={task.isCompleted}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KanbanBoard; 