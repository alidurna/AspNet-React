/**
 * Tasks Sayfası Component - Modern UI/UX Tasarımı
 *
 * Bu dosya, kullanıcıların görevlerini yönetebilmesi için tasarlanmış
 * modern ve responsive tasks sayfasını içerir.
 *
 * Ana Özellikler:
 * - Modern card-based tasarım
 * - Responsive grid layout
 * - Smooth animasyonlar
 * - İntuitive kullanıcı arayüzü
 * - Real-time güncellemeler
 * - Drag & drop desteği (gelecekte)
 *
 * @author TaskFlow Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { tasksAPI, categoriesAPI } from "../services/api";
import type {
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
} from "../types/task.types";
import type { CategoryDto } from "../types/category.types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../hooks/useToast";
import { useAnalytics } from "../hooks/useAnalytics";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaFlag, 
  FaUser,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaColumns
} from "react-icons/fa";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import KanbanBoard from "../components/tasks/KanbanBoard";
import ProgressSlider from "../components/tasks/ProgressSlider";



/**
 * Priority renk ve icon mapping'i
 */
const PRIORITY_CONFIG = {
  0: { color: "text-gray-500", bg: "bg-gray-100", icon: FaFlag, label: "Düşük" },
  1: { color: "text-blue-500", bg: "bg-blue-100", icon: FaFlag, label: "Normal" },
  2: { color: "text-orange-500", bg: "bg-orange-100", icon: FaFlag, label: "Yüksek" },
  3: { color: "text-red-500", bg: "bg-red-100", icon: FaExclamationTriangle, label: "Kritik" },
};

/**
 * Tasks Sayfası Component
 */
const Tasks: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<TodoTaskDto | null>(null);
  const [taskForm, setTaskForm] = useState<CreateTodoTaskDto | UpdateTodoTaskDto>({
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    categoryId: undefined,
  });
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');

  // Hooks
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const analytics = useAnalytics();
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => handleOpenModal(),
    onSearch: () => (document.querySelector('input[placeholder="Görevlerde ara..."]') as HTMLInputElement)?.focus(),
    onToggleView: () => setViewMode(prev => prev === 'grid' ? 'list' : prev === 'list' ? 'kanban' : 'grid'),
    onEscape: () => {
      if (isModalOpen) handleCloseModal();
      if (taskToDelete) setTaskToDelete(null);
    }
  });

  const pageSize = 12;

  // API Queries
  const {
    data: tasksResponse,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", page, pageSize, searchQuery, selectedCategory],
    queryFn: () =>
      tasksAPI.getTasks({
        Page: page,
        PageSize: pageSize,
        SearchText: searchQuery,
        CategoryId: selectedCategory ? Number(selectedCategory) : undefined,
      }),
    staleTime: 30000,
  });

  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getCategories(),
    staleTime: 300000,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTodoTaskDto) => {
      console.log("🚀 Gönderilen veri:", data);
      return tasksAPI.createTask(data);
    },
    onSuccess: (response) => {
      showSuccess("Görev başarıyla oluşturuldu!");
      setIsModalOpen(false);
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      analytics.trackEvent('user_action', 'task_created', { taskId: response.data.id });
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      const errorMessage = error.response?.data?.message || "Görev oluşturulurken hata oluştu";
      showError(errorMessage);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateTodoTaskDto & { id: number }) =>
      tasksAPI.updateTask(id, data),
    onSuccess: (response) => {
      showSuccess("Görev başarıyla güncellendi!");
      setIsModalOpen(false);
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      analytics.trackEvent('user_action', 'task_updated', { taskId: response.data.id });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Görev güncellenirken hata oluştu";
      showError(errorMessage);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksAPI.deleteTask,
    onSuccess: () => {
      showSuccess("Görev başarıyla silindi!");
      setTaskToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      analytics.trackEvent('user_action', 'task_deleted', {});
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Görev silinirken hata oluştu";
      showError(errorMessage);
    },
  });

  // Handlers
  const handleOpenModal = (task?: TodoTaskDto) => {
    if (task) {
      setCurrentTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : "",
        priority: task.priority,
        categoryId: task.categoryId,
      });
    } else {
      setCurrentTask(null);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        categoryId: 6,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      priority: 1,
      categoryId: undefined,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setTaskForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
               name === "priority" ? parseInt(value) :
               name === "categoryId" ? (value === "" ? undefined : parseInt(value)) :
               value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
      priority: taskForm.priority || 1,
      categoryId: taskForm.categoryId,
    };

    if (currentTask) {
      analytics.trackEvent('user_action', 'task_updated', {
        taskId: currentTask.id,
        priority: taskForm.priority,
        hasCategory: !!taskForm.categoryId,
        hasDueDate: !!taskForm.dueDate
      });
      updateTaskMutation.mutate({
        id: currentTask.id,
        ...taskData,
      } as UpdateTodoTaskDto & { id: number });
    } else {
      console.log("🚀 Gönderilen veri:", taskData);
      analytics.trackEvent('user_action', 'task_created', {
        priority: taskForm.priority,
        hasCategory: !!taskForm.categoryId,
        hasDueDate: !!taskForm.dueDate
      });
      createTaskMutation.mutate(taskData as CreateTodoTaskDto);
    }
  };

  const handleToggleComplete = async (taskId: number, isCompleted: boolean) => {
    analytics.trackEvent('user_action', 'task_completed', {
      taskId,
      isCompleted,
      action: isCompleted ? 'complete' : 'uncomplete'
    });

    try {
      await tasksAPI.completeTask(taskId, isCompleted);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess(isCompleted ? "Görev tamamlandı!" : "Görev aktif hale getirildi!");
    } catch (error) {
      showError("Görev durumu güncellenirken hata oluştu");
    }
  };

  const handleProgressChange = async (taskId: number, progress: number) => {
    analytics.trackEvent('user_action', 'task_progress_updated', {
      taskId,
      progress,
      action: progress === 0 ? 'start' : progress === 100 ? 'complete' : 'progress'
    });

    try {
      await tasksAPI.updateTaskProgress(taskId, progress);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess(`Görev ilerlemesi %${progress} olarak güncellendi!`);
    } catch (error) {
      showError("Görev ilerlemesi güncellenirken hata oluştu");
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isToday(date)) return "Bugün";
    if (isTomorrow(date)) return "Yarın";
    return format(date, "d MMM", { locale: tr });
  };

  const getDueDateColor = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return "text-red-500";
    if (isToday(date)) return "text-orange-500";
    if (isTomorrow(date)) return "text-yellow-500";
    return "text-gray-500";
  };

  // Filtered and sorted tasks  
  const filteredTasks = useMemo(() => {
    if (tasksResponse?.data && 'tasks' in tasksResponse.data) {
      return tasksResponse.data.tasks || [];
    }
    return [];
  }, [tasksResponse?.data]);

  if (isTasksLoading || isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Görevler
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {filteredTasks.length} görev bulundu
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FaColumns className="w-4 h-4" />
                </button>
              </div>

              {/* New Task Button */}
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Görev</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Görevlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Kategoriler</option>
                {categoriesResponse?.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FaPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz görev bulunmamaktadır
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              İlk görevinizi oluşturarak başlayın
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaPlus className="w-4 h-4" />
              Yeni Görev Ekle
            </motion.button>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            categories={categoriesResponse?.data || []}
            onEdit={handleOpenModal}
            onDelete={setTaskToDelete}
            onToggleComplete={handleToggleComplete}
            onProgressChange={handleProgressChange}
          />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  viewMode={viewMode}
                  onEdit={() => handleOpenModal(task)}
                  onDelete={() => setTaskToDelete(task.id)}
                  onToggleComplete={(isCompleted) => handleToggleComplete(task.id, isCompleted)}
                  onProgressChange={(taskId, progress) => handleProgressChange(taskId, progress)}
                  categories={categoriesResponse?.data || []}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={currentTask}
          taskForm={taskForm}
          onChange={handleChange}
          onSubmit={handleSubmit}
          categories={categoriesResponse?.data || []}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <DeleteConfirmationModal
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => deleteTaskMutation.mutate(taskToDelete)}
          isLoading={deleteTaskMutation.isPending}
        />
      )}
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: TodoTaskDto;
  viewMode: 'grid' | 'list' | 'kanban';
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: (isCompleted: boolean) => void;
  onProgressChange: (taskId: number, progress: number) => void;
  categories: CategoryDto[];
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  viewMode,
  onEdit,
  onDelete,
  onToggleComplete,
  onProgressChange,
  categories,
}: TaskCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
  const category = categories.find(c => c.id === task.categoryId);

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
        }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(!task.isCompleted)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
            }`}
          >
            {task.isCompleted && <FaCheck className="w-3 h-3" />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className={`font-medium truncate ${
                task.isCompleted 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              
              {/* Priority Badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
                <priority.icon className="w-3 h-3" />
                {priority.label}
              </span>

                             {/* Category Badge */}
               {category && (
                 <span 
                   className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500"
                 >
                   {category.name}
                 </span>
               )}

               {/* Due Date */}
               {task.dueDate && (
                 <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                   <FaCalendarAlt className="w-3 h-3" />
                   {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                 </span>
               )}
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Slider for List View */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <ProgressSlider
            currentProgress={task.progress}
            onProgressChange={(progress) => onProgressChange(task.id, progress)}
            isCompleted={task.isCompleted}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 group"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleComplete(!task.isCompleted)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              task.isCompleted
                ? 'bg-green-500 border-green-500 text-white scale-110'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:scale-110'
            }`}
          >
            {task.isCompleted && <FaCheck className="w-3 h-3" />}
          </button>
          
          {/* Priority Indicator */}
          <div className={`w-3 h-3 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaEllipsisV className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <FaEdit className="w-3 h-3" />
                Düzenle
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <FaTrash className="w-3 h-3" />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h3 className={`text-lg font-semibold mb-2 ${
        task.isCompleted 
          ? 'text-gray-500 dark:text-gray-400 line-through' 
          : 'text-gray-900 dark:text-white'
      }`}>
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress Slider */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <ProgressSlider
          currentProgress={task.progress}
          onProgressChange={(progress) => onProgressChange(task.id, progress)}
          isCompleted={task.isCompleted}
        />
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
                     {/* Category */}
           {category && (
             <span 
               className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500"
             >
               {category.name}
             </span>
           )}
           
           {/* Priority */}
           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
             <priority.icon className="w-3 h-3" />
             {priority.label}
           </span>
         </div>

         {/* Due Date */}
         {task.dueDate && (
           <div className="flex items-center gap-1 text-xs text-gray-500">
             <FaCalendarAlt className="w-3 h-3" />
             {new Date(task.dueDate).toLocaleDateString('tr-TR')}
           </div>
         )}
      </div>
    </motion.div>
  );
};

// Task Modal Component
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TodoTaskDto | null;
  taskForm: CreateTodoTaskDto | UpdateTodoTaskDto;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: CategoryDto[];
  isLoading: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  taskForm,
  onChange,
  onSubmit,
  categories,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Görev başlığını girin..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={onChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Görev açıklamasını girin..."
              />
            </div>

            {/* Row: Priority and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Öncelik
                </label>
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Düşük</option>
                  <option value={1}>Normal</option>
                  <option value={2}>Yüksek</option>
                  <option value={3}>Kritik</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                <select
                  name="categoryId"
                  value={taskForm.categoryId || ""}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Son Tarih
              </label>
              <input
                type="date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                             >
                 {isLoading && <LoadingSpinner size="sm" />}
                 {task ? 'Güncelle' : 'Oluştur'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <FaTrash className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Görevi Sil
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Bu işlem geri alınamaz
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
                         >
               {isLoading && <LoadingSpinner size="sm" />}
               Sil
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
