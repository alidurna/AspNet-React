/**
 * Tasks Page - Refactored to Modular Components
 * 
 * Ana görev yönetimi sayfası. Modüler sub-components kullanır.
 * 
 * @version 4.0.0 - Fully Modular
 */

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
} from "../types/tasks";

// Modular Components
import TasksHeader from "./components/TasksHeader";
import TasksContent from "./components/TasksContent";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskModal from "../components/tasks/TaskModal";

// Hooks
import { useToast } from "../hooks/useToast";
import { useAnalytics } from "../hooks/useAnalytics";

/**
 * Tasks Page Component - Fully Modular
 */
const Tasks: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTaskDto | null>(null);

  // ===== HOOKS =====
  const { showSuccess, showError } = useToast();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();

  // ===== DATA FETCHING =====
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.getTasks(),
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const tasks = tasksResponse?.data?.tasks || [];
  const categories = categoriesResponse?.data || [];

  // ===== MUTATIONS =====
  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTodoTaskDto) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla oluşturuldu!');
      trackEvent('user_action', 'task_created');
      setIsTaskModalOpen(false);
    },
    onError: () => showError('Görev oluşturulurken hata oluştu'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoTaskDto }) => 
      api.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla güncellendi!');
      trackEvent('user_action', 'task_updated');
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: () => showError('Görev güncellenirken hata oluştu'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla silindi!');
      trackEvent('user_action', 'task_deleted');
    },
    onError: () => showError('Görev silinirken hata oluştu'),
  });

  // ===== FILTERED TASKS =====
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: TodoTaskDto) => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && task.categoryId !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority && task.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'completed' && !task.isCompleted) {
        return false;
      }
      if (selectedStatus === 'pending' && task.isCompleted) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedStatus]);

  // ===== EVENT HANDLERS =====
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: TodoTaskDto) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleComplete = (taskId: number, isCompleted: boolean) => {
    const task = tasks.find((t: TodoTaskDto) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        id: taskId,
        data: { ...task, isCompleted, progress: isCompleted ? 100 : task.progress }
      });
    }
  };

  const handleProgressChange = (taskId: number, progress: number) => {
    const task = tasks.find((t: TodoTaskDto) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        id: taskId,
        data: { ...task, progress, isCompleted: progress >= 100 }
      });
    }
  };

  const handleTaskSubmit = (taskData: CreateTodoTaskDto | UpdateTodoTaskDto) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskData as UpdateTodoTaskDto });
    } else {
      createTaskMutation.mutate(taskData as CreateTodoTaskDto);
    }
  };

  // ===== STATS =====
  const completedCount = filteredTasks.filter((task: TodoTaskDto) => task.isCompleted).length;

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-indigo-100/10 via-blue-100/10 to-purple-100/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <TasksHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onCreateTask={handleCreateTask}
          tasksCount={filteredTasks.length}
          completedCount={completedCount}
        />

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
            <TaskFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>
        )}

        {/* Content */}
        <TasksContent
          tasks={filteredTasks}
          categories={categories}
          viewMode={viewMode}
          isLoading={tasksLoading || categoriesLoading}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onProgressChange={handleProgressChange}
        />

        {/* Task Modal */}
        {isTaskModalOpen && (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleTaskSubmit}
            task={editingTask}
            categories={categories}
            isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks;