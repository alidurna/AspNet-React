/**
 * Tasks Page - Yeni Tasarım
 * 
 * Ana görev yönetimi sayfası.
 */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
} from "../types/tasks";
import type { CategoryDto } from "../types/tasks";

// Components
import TasksHeader from "./components/TasksHeader";
import TasksContent from "./components/TasksContent";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskModal from "../components/tasks/TaskModal";
import SubTasksModal from "../components/tasks/SubTasksModal";
import SubTaskModal from "../components/tasks/SubTaskModal";
import DependencyModal from "../components/tasks/DependencyModal";

// Hooks
import { useToast } from "../hooks/useToast";

/**
 * Tasks Page Component - Yeni Tasarım
 */
const Tasks: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTaskDto | null>(null);
  
  // Alt görevler için state'ler
  const [isSubTasksModalOpen, setIsSubTasksModalOpen] = useState(false);
  const [selectedParentTask, setSelectedParentTask] = useState<TodoTaskDto | null>(null);
  
  // Alt görev modal'ı için state'ler
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState<TodoTaskDto | null>(null);
  const [selectedParentForSubTask, setSelectedParentForSubTask] = useState<TodoTaskDto | null>(null);

  // Bağımlılık modal'ı için state'ler
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [dependencyModalMode, setDependencyModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTaskForDependency, setSelectedTaskForDependency] = useState<TodoTaskDto | null>(null);

  // Hooks
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // Sayfa yüklendiğinde cache'i temizle
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['subTasks'] });
  }, [queryClient]);

  // Data fetching
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.getTasks({ OnlyParentTasks: true }), // Sadece ana görevleri getir
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const tasks = tasksResponse?.data?.tasks || [];
  const categories = categoriesResponse?.data || [];

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTodoTaskDto) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla oluşturuldu!');
      setIsTaskModalOpen(false);
    },
    onError: () => showError('Görev oluşturulurken hata oluştu'),
  });

  const createSubTaskMutation = useMutation({
    mutationFn: ({ parentId, taskData }: { parentId: number; taskData: CreateTodoTaskDto }) => 
      api.createSubTask(parentId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Alt görev başarıyla oluşturuldu!');
      setIsSubTaskModalOpen(false);
      setSelectedParentForSubTask(null);
      
      // Alt görev oluşturduktan sonra SubTasksModal'ı yeniden aç
      if (selectedParentForSubTask) {
        setSelectedParentTask(selectedParentForSubTask);
        setIsSubTasksModalOpen(true);
      }
    },
    onError: () => showError('Alt görev oluşturulurken hata oluştu'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (taskData: UpdateTodoTaskDto) => api.updateTask(editingTask!.id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla güncellendi!');
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
    onError: () => showError('Görev güncellenirken hata oluştu'),
  });

  const updateSubTaskMutation = useMutation({
    mutationFn: (taskData: UpdateTodoTaskDto) => api.updateTask(editingSubTask!.id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Alt görev başarıyla güncellendi!');
      setIsSubTaskModalOpen(false);
      setEditingSubTask(null);
      setSelectedParentForSubTask(null);
    },
    onError: () => showError('Alt görev güncellenirken hata oluştu'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Görev başarıyla silindi!');
    },
    onError: () => showError('Görev silinirken hata oluştu'),
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: number; isCompleted: boolean }) =>
      api.updateTask(taskId, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Alt görevler için de cache'i invalidate et
      queryClient.invalidateQueries({ queryKey: ['subTasks'] });
    },
    onError: () => showError('Görev durumu güncellenirken hata oluştu'),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ taskId, progress }: { taskId: number; progress: number }) =>
      api.updateTask(taskId, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Alt görevler için de cache'i invalidate et
      queryClient.invalidateQueries({ queryKey: ['subTasks'] });
    },
    onError: () => showError('İlerleme güncellenirken hata oluştu'),
  });

  // Handlers
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
    toggleCompleteMutation.mutate({ taskId, isCompleted });
  };

  const handleProgressChange = (taskId: number, progress: number) => {
    updateProgressMutation.mutate({ taskId, progress });
  };

  const handleTaskSubmit = (taskData: CreateTodoTaskDto | UpdateTodoTaskDto) => {
    if (editingTask) {
      updateTaskMutation.mutate(taskData as UpdateTodoTaskDto);
    } else {
      createTaskMutation.mutate(taskData as CreateTodoTaskDto);
    }
  };

  // Alt görevler için handler'lar
  const handleViewSubTasks = (taskId: number) => {
    const parentTask = tasks.find(task => task.id === taskId);
    if (parentTask) {
      setSelectedParentTask(parentTask);
      setIsSubTasksModalOpen(true);
    }
  };

  const handleAddSubTask = (taskId: number) => {
    const parentTask = tasks.find(task => task.id === taskId);
    if (parentTask) {
      setSelectedParentForSubTask(parentTask);
      setEditingSubTask(null);
      setIsSubTaskModalOpen(true);
    }
  };

  const handleEditSubTask = (subTask: TodoTaskDto) => {
    const parentTask = tasks.find(task => task.id === subTask.parentTaskId);
    if (parentTask) {
      setSelectedParentForSubTask(parentTask);
      setEditingSubTask(subTask);
      setIsSubTaskModalOpen(true);
    }
  };

  const handleDeleteSubTask = (subTaskId: number) => {
    if (window.confirm('Bu alt görevi silmek istediğinizden emin misiniz?')) {
      deleteTaskMutation.mutate(subTaskId);
    }
  };

  const handleToggleSubTaskComplete = (subTaskId: number, isCompleted: boolean) => {
    console.log('Tasks.tsx - Alt görev tamamlanma durumu değişiyor:', { subTaskId, isCompleted });
    toggleCompleteMutation.mutate({ taskId: subTaskId, isCompleted });
  };

  const handleSubTaskProgressChange = (subTaskId: number, progress: number) => {
    console.log('Tasks.tsx - Alt görev ilerleme değişiyor:', { subTaskId, progress });
    updateProgressMutation.mutate({ taskId: subTaskId, progress });
  };

  const handleSubTaskSubmit = (taskData: CreateTodoTaskDto | UpdateTodoTaskDto) => {
    if (editingSubTask) {
      updateSubTaskMutation.mutate(taskData as UpdateTodoTaskDto);
    } else {
      createSubTaskMutation.mutate({ 
        parentId: selectedParentForSubTask!.id, 
        taskData: taskData as CreateTodoTaskDto 
      });
    }
  };

  // Bağımlılık handler'ları
  const handleViewDependencies = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForDependency(task);
      setDependencyModalMode('view');
      setIsDependencyModalOpen(true);
    }
  };

  const handleAddDependency = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForDependency(task);
      setDependencyModalMode('create');
      setIsDependencyModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TasksHeader
        onCreateTask={handleCreateTask}
        tasksCount={tasks.length}
        completedCount={tasks.filter(t => t.isCompleted).length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Filters */}
      <TaskFilters
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Content */}
      <TasksContent
        tasks={tasks}
        categories={categories}
        isLoading={tasksLoading || categoriesLoading}
        viewMode={viewMode}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onProgressChange={handleProgressChange}
        onViewSubTasks={handleViewSubTasks}
        onAddSubTask={handleAddSubTask}
        onViewDependencies={handleViewDependencies}
        onAddDependency={handleAddDependency}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSubmit}
        task={editingTask || undefined}
        categories={categories}
      />

      {/* SubTasks Modal */}
      {selectedParentTask && (
        <SubTasksModal
          isOpen={isSubTasksModalOpen}
          onClose={() => {
            setIsSubTasksModalOpen(false);
            setSelectedParentTask(null);
          }}
          parentTask={selectedParentTask}
          categories={categories}
          onAddSubTask={handleAddSubTask}
          onEditSubTask={handleEditSubTask}
          onDeleteSubTask={handleDeleteSubTask}
          onToggleSubTaskComplete={handleToggleSubTaskComplete}
          onSubTaskProgressChange={handleSubTaskProgressChange}
        />
      )}

      {/* SubTask Modal */}
      {selectedParentForSubTask && (
        <SubTaskModal
          isOpen={isSubTaskModalOpen}
          onClose={() => {
            setIsSubTaskModalOpen(false);
            setSelectedParentForSubTask(null);
            setEditingSubTask(null);
            
            // Alt görev oluşturduktan sonra SubTasksModal'ı yeniden aç
            if (selectedParentForSubTask) {
              setSelectedParentTask(selectedParentForSubTask);
              setIsSubTasksModalOpen(true);
            }
          }}
          onSave={handleSubTaskSubmit}
          parentTask={selectedParentForSubTask}
          subTask={editingSubTask || undefined}
          categories={categories}
        />
      )}

      {/* Dependency Modal */}
      {selectedTaskForDependency && (
        <DependencyModal
          isOpen={isDependencyModalOpen}
          onClose={() => {
            setIsDependencyModalOpen(false);
            setSelectedTaskForDependency(null);
            setDependencyModalMode('create');
          }}
          taskId={selectedTaskForDependency.id}
          mode={dependencyModalMode}
        />
      )}
    </div>
  );
};

export default Tasks;