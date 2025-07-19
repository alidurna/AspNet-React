import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tasksAPI,
  categoriesAPI,
  type TodoTaskDto,
  type CategoryDto,
  type CreateTodoTaskDto,
  type UpdateTodoTaskDto,
  type TodoTaskFilterDto,
  type ApiResponse,
} from "../services/api";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Skeleton, SkeletonGroup } from "../components/ui/Skeleton";
import ConfirmModal from "../components/ui/ConfirmModal";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import { useToast } from "../hooks/useToast";
import { useOptimisticUpdate, useOptimisticList } from "../hooks/useOptimisticUpdate";
import { useOfflineFirst } from "../hooks/useOfflineFirst";
import { useAnalytics } from "../hooks/useAnalytics";
import { format } from "date-fns";
import useSignalR from "../hooks/useSignalR";

// PaginationMetadata tipini tanımla
interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// UpdateTaskProgressDto tipini tanımla
interface UpdateTaskProgressDto {
  progress: number;
}

/**
 * Tasks sayfası, kullanıcının görevlerini yönetebileceği ana arayüzü sağlar.
 * Bu sayfa, görevleri listeler, yeni görevler oluşturmaya, mevcut görevleri düzenlemeye ve silmeye olanak tanır.
 * Ayrıca, görev ilerlemesini güncelleyebilir ve kategoriye göre filtreleme yapabilir.
 * React Query kütüphanesi, API çağrılarının ve durum yönetiminin verimli bir şekilde yapılmasını sağlar.
 */
const Tasks: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Analytics tracking
  const analytics = useAnalytics({
    debug: import.meta.env.DEV,
    endpoint: '/api/analytics'
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<TodoTaskDto | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false); // Yeni state: Detay görüntüleme modunda mı?
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]); // Yeni state: Seçilen görev ID'leri
  const [taskForm, setTaskForm] = useState<
    CreateTodoTaskDto | UpdateTodoTaskDto
  >({
    // 'isCompleted' kaldırıldı
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    categoryId: undefined,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // SignalR bağlantısı
  const { connection } = useSignalR();

  // Page view tracking
  useEffect(() => {
    analytics.trackPageView('Tasks Page');
  }, [analytics]);

  // Görevleri çekmek için React Query kullanımı
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery<ApiResponse<TodoTaskDto[]>, Error>({
    queryKey: ["tasks", page, pageSize, searchQuery, selectedCategory],
    queryFn: async ({ queryKey }) => {
      const [_key, page, pageSize, searchQuery, selectedCategory] = queryKey;
      return tasksAPI.getTasks({
        pageNumber: page as number,
        pageSize: pageSize as number,
        searchQuery: searchQuery as string,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
      });
    },
  });

  // Offline-first yaklaşımı için hook
  const offlineTasks = useOfflineFirst<TodoTaskDto[]>(
    tasksData?.data || [],
    {
      cacheKey: 'tasks-cache',
      cacheExpiry: 10 * 60 * 1000, // 10 dakika
      strategy: 'stale-while-revalidate',
      onSync: (data) => {
        console.log('Tasks synced:', data);
      },
      onError: (error) => {
        showError(`Senkronizasyon hatası: ${error.message}`);
      }
    }
  );

  // Optimistic updates için hook
  const optimisticTasks = useOptimisticList<TodoTaskDto>(
    tasksData?.data || [],
    {
      getId: (task) => task.id,
      onSuccess: (data) => {
        console.log('Optimistic update successful:', data);
      },
      onError: (error, originalData) => {
        showError(`Optimistic update failed: ${error.message}`);
        console.log('Rolling back to:', originalData);
      }
    }
  );

  // Kategorileri çekmek için React Query kullanımı
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery<
    ApiResponse<CategoryDto[]>,
    Error,
    ApiResponse<CategoryDto[]>,
    string[]
  >(
    { queryKey: ["categories"], queryFn: () => categoriesAPI.getCategories() } // queryFn düzeltildi
  );

  // Görev oluşturma mutasyonu
  const createTaskMutation = useMutation({
    mutationFn: (newTask: CreateTodoTaskDto) => tasksAPI.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Görev başarıyla oluşturuldu.");
      setIsModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Low",
        categoryId: undefined,
      });
    },
    onError: (error) => {
      showError(`Görev oluşturulurken hata oluştu: ${error.message}`);
    },
  });

  // Görev güncelleme mutasyonu
  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: UpdateTodoTaskDto & { id: number }) =>
      tasksAPI.updateTask(updatedTask.id, updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Görev başarıyla güncellendi.");
      setIsModalOpen(false);
      setCurrentTask(null);
    },
    onError: (error) => {
      showError(`Görev güncellenirken hata oluştu: ${error.message}`);
    },
  });

  // Görev silme mutasyonu
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => tasksAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Görev başarıyla silindi.");
      setShowConfirmModal(false);
      setTaskToDelete(null);
    },
    onError: (error) => {
      showError(`Görev silinirken hata oluştu: ${error.message}`);
    },
  });

  // Görev ilerlemesi güncelleme mutasyonu
  const updateTaskProgressMutation = useMutation({
    mutationFn: (data: {
      taskId: number;
      updateProgressDto: UpdateTaskProgressDto;
    }) => tasksAPI.updateTaskProgress(data.taskId, data.updateProgressDto.progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Görev ilerlemesi güncellendi.");
    },
    onError: (error) => {
      showError(
        `Görev ilerlemesi güncellenirken hata oluştu: ${(error as Error).message}`
      );
    },
  });

  // Toplu görev silme mutasyonu
  const bulkDeleteTasksMutation = useMutation({
    mutationFn: (taskIds: number[]) => tasksAPI.bulkDeleteTasks({ taskIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Seçilen görevler başarıyla silindi.");
      setSelectedTaskIds([]); // Seçimi temizle
    },
    onError: (error) => {
      showError(`Toplu silme başarısız oldu: ${error.message}`);
    },
  });

  // Toplu görev tamamlama mutasyonu
  const bulkCompleteTasksMutation = useMutation({
    mutationFn: (taskIds: number[]) => tasksAPI.bulkCompleteTasks({ taskIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Seçilen görevler başarıyla tamamlandı.");
      setSelectedTaskIds([]); // Seçimi temizle
    },
    onError: (error) => {
      showError(`Toplu tamamlama başarısız oldu: ${error.message}`);
    },
  });

  // SignalR TaskUpdate olayını dinle ve görevleri yeniden getir
  useEffect(() => {
    if (connection) {
      const handleTaskUpdate = (data: any) => {
        console.log("SignalR: Görev güncellemesi alındı:", data);
        // Görevlerle ilgili herhangi bir güncelleme olduğunda 'tasks' query key'ini invalidate et
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        // İsteğe bağlı: Spesifik görev ID'sine göre güncellemeleri daha detaylı işleyebiliriz
        // Ancak genel bir invalidate, tüm listeyi güncel tutmak için yeterli.
      };

      connection.on("TaskUpdate", handleTaskUpdate);

      // Component unmount edildiğinde veya connection değiştiğinde event listener'ı temizle
      return () => {
        connection.off("TaskUpdate", handleTaskUpdate);
      };
    }
  }, [connection, queryClient]);

  const handleOpenModal = (task?: TodoTaskDto, viewOnly: boolean = false) => {
    if (task) {
      setCurrentTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        priority: task.priority,
        categoryId: task.categoryId || undefined,
        // isCompleted kaldırıldı
      });
    } else {
      setCurrentTask(null);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Low",
        categoryId: undefined,
        // isCompleted kaldırıldı
      });
    }
    setIsViewingDetails(viewOnly); // Modalı detay görüntüleme modunda aç
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setIsViewingDetails(false); // Modalı kapatırken detay modunu sıfırla
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "isCompleted") {
      // isCompleted için özel durum
      // isCompleted checkbox'ı doğrudan task.id ile handleToggleComplete'i çağırır, form state'ini güncellemez.
      // Bu yüzden burada bir şey yapmaya gerek yok.
      return;
    }

    setTaskForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      categoryId: taskForm.categoryId || undefined,
    };

    // Analytics tracking
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
      analytics.trackEvent('user_action', 'task_created', {
        priority: taskForm.priority,
        hasCategory: !!taskForm.categoryId,
        hasDueDate: !!taskForm.dueDate
      });
      createTaskMutation.mutate(taskData as CreateTodoTaskDto);
    }
  };

  const handleDelete = () => {
    if (taskToDelete !== null) {
      analytics.trackEvent('user_action', 'task_deleted', {
        taskId: taskToDelete
      });
      deleteTaskMutation.mutate(taskToDelete);
    }
  };

  const handleSearch = () => {
    analytics.trackEvent('search', 'task_search', {
      query: searchQuery,
      category: selectedCategory
    });
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    analytics.trackEvent('filter', 'category_filter', {
      category: e.target.value || 'all'
    });
    setSelectedCategory(e.target.value === "" ? null : e.target.value);
    setPage(1);
  };

  const handleToggleComplete = (taskId: number, isCompleted: boolean) => {
    // Analytics tracking
    analytics.trackEvent('user_action', 'task_completed', {
      taskId,
      isCompleted,
      action: isCompleted ? 'complete' : 'uncomplete'
    });

    // Optimistic update
    optimisticTasks.updateItem(
      taskId,
      (task) => ({ ...task, isCompleted }),
      async () => {
        // Backend call - progress ile güncelle
        await tasksAPI.updateTaskProgress(taskId, isCompleted ? 100 : 0);
        // Return updated tasks list
        const response = await tasksAPI.getTasks({
          pageNumber: page,
          pageSize: pageSize,
          searchQuery: searchQuery,
          categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        });
        return response.data;
      }
    );
  };

  const handleSelectTask = (taskId: number, isSelected: boolean) => {
    setSelectedTaskIds((prev) =>
      isSelected ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  };

  const handleSelectAllTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      const allTaskIds = optimisticTasks.data?.map((task) => task.id) || [];
      setSelectedTaskIds(allTaskIds);
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.length > 0) {
      analytics.trackEvent('bulk_action', 'bulk_delete', {
        count: selectedTaskIds.length,
        taskIds: selectedTaskIds
      });
      bulkDeleteTasksMutation.mutate(selectedTaskIds);
    } else {
      showError("Lütfen silmek için en az bir görev seçin.");
    }
  };

  const handleBulkComplete = () => {
    if (selectedTaskIds.length > 0) {
      analytics.trackEvent('bulk_action', 'bulk_complete', {
        count: selectedTaskIds.length,
        taskIds: selectedTaskIds
      });
      bulkCompleteTasksMutation.mutate(selectedTaskIds);
    } else {
      showError("Lütfen tamamlamak için en az bir görev seçin.");
    }
  };

  const isAllTasksSelected = (
    optimisticTasks.data?.length ?? 0
  ) > 0 && selectedTaskIds.length === (optimisticTasks.data?.length ?? 0);

  const isAnyTaskSelected = selectedTaskIds.length > 0;

  if (isLoadingTasks || isLoadingCategories) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Görevler
        </h1>
        
        {/* Skeleton Loading */}
        <SkeletonGroup>
          {/* Search Bar Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton variant="input" className="flex-grow" />
            <Skeleton variant="button" size="md" />
            <Skeleton variant="input" className="w-48" />
            <Skeleton variant="button" size="md" />
          </div>
          
          {/* Task Cards Skeleton */}
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="card" className="h-24" />
          ))}
        </SkeletonGroup>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="text-red-500">
        Görevler yüklenirken hata oluştu: {(tasksError as Error)?.message ?? 'Bilinmeyen bir hata oluştu.'}
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="text-red-500">
        Kategoriler yüklenirken hata oluştu: {(categoriesError as Error)?.message ?? 'Bilinmeyen bir hata oluştu.'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Görevler
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Görev ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
        <Button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Ara
        </Button>
        <select
          className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onChange={handleCategoryChange}
          value={selectedCategory || ""}
        >
          <option value="">Tüm Kategoriler</option>
          {categories?.data.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Yeni Görev Ekle
        </Button>
      </div>

      {/* Toplu İşlem Kontrolleri */}
      {isAnyTaskSelected && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
          <p className="text-gray-700 dark:text-gray-300 self-center">
            {selectedTaskIds.length} görev seçildi.
          </p>
          <Button
            onClick={handleBulkComplete}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Seçilenleri Tamamla
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
          >
            Seçilenleri Sil
          </Button>
        </div>
      )}

      {/* Görev Listesi */}
      {isLoadingTasks ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (optimisticTasks.data?.length ?? 0) === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Henüz görev bulunmamaktadır.</p>
          {offlineTasks.isOffline && (
            <p className="text-gray-400 text-sm">
              Çevrimdışı mod - Veriler cache'den yükleniyor
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Offline Status */}
          {offlineTasks.isOffline && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-600 text-sm">
                Çevrimdışı mod - Değişiklikler senkronize edilecek
              </p>
            </div>
          )}
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm mb-2">
            <input
              type="checkbox"
              checked={isAllTasksSelected}
              onChange={handleSelectAllTasks}
              className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="selectAllTasks" className="text-md font-semibold text-gray-800 dark:text-white">
              Tümünü Seç / Seçimi Kaldır
            </label>
          </div>
          {optimisticTasks.data?.map((task) => (
            <Card key={task.id} className="p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => handleSelectTask(task.id, !selectedTaskIds.includes(task.id))}
                  className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    <span>Öncelik: {task.priority}</span>
                    {task.dueDate && (
                      <span className="ml-4">Bitiş Tarihi: {format(new Date(task.dueDate), "dd.MM.yyyy")}
                      </span>
                    )}
                    {task.categoryName && (
                      <span className="ml-4">Kategori: {task.categoryName}</span>
                    )}
                    <span className="ml-4">Durum: {task.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(task, true)} // Detay görüntüleme modu
                >
                  Detayları Görüntüle
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(task)}>
                  Düzenle
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setTaskToDelete(task.id);
                    setShowConfirmModal(true);
                  }}
                >
                  Sil
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sayfalama Kontrolleri */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-gray-300 dark:bg-gray-700 dark:text-white"
        >
          Önceki
        </Button>
        <span className="text-gray-700 dark:text-gray-300">
          Sayfa {page} /{" "}
          {Math.ceil((optimisticTasks.data?.length || 0) / pageSize)}
        </span>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={
            page * pageSize >= (optimisticTasks.data?.length || 0)
          }
          className="bg-gray-300 dark:bg-gray-700 dark:text-white"
        >
          Sonraki
        </Button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Görevi Sil"
        message="Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />

      {isModalOpen && !isViewingDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              {currentTask ? "Görevi Düzenle" : "Yeni Görev Ekle"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Başlık:
                </label>
                <Input
                  id="title"
                  name="title"
                  value={taskForm.title}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Açıklama:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={taskForm.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="dueDate"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Son Tarih:
                </label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="priority"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Öncelik:
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Low">Düşük</option>
                  <option value="Medium">Orta</option>
                  <option value="High">Yüksek</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="categoryId"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                >
                  Kategori:
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={taskForm.categoryId || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Kategori Seç</option>
                  {categories?.data.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 flex items-center">
                <input
                  id="isCompleted"
                  name="isCompleted"
                  type="checkbox"
                  checked={currentTask?.isCompleted || false} // isCompleted'ı form state'inden çıkarıp currentTask'tan al
                  onChange={(e) =>
                    handleToggleComplete(currentTask!.id, e.target.checked)
                  } // doğrudan toggle fonksiyonunu çağır
                  className="mr-2 leading-tight"
                />
                <label
                  htmlFor="isCompleted"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Tamamlandı
                </label>
              </div>
              <div className="flex justify-end gap-4">
                {isViewingDetails ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Kapat
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={
                        createTaskMutation.isPending || updateTaskMutation.isPending
                      }
                    >
                      {currentTask ? "Kaydet" : "Oluştur"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {isModalOpen && isViewingDetails && currentTask && (
        <TaskDetailModal
          isOpen={isModalOpen} // isOpen prop'unu ekle
          taskId={currentTask.id}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
};

export default Tasks;
