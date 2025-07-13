import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tasksAPI,
  categoriesAPI,
  type TodoTaskDto, // 'type' anahtar kelimesi eklendi
  type CategoryDto, // 'type' anahtar kelimesi eklendi
  type UpdateTaskProgressDto, // 'type' anahtar kelimesi eklendi
  type CreateTodoTaskDto, // 'type' anahtar kelimesi eklendi
  type UpdateTodoTaskDto, // 'type' anahtar kelimesi eklendi
  type TodoTaskFilterDto, // 'type' anahtar kelimesi eklendi
  type ApiResponse, // ApiResponse eklendi
  type PaginationMetadata, // PaginationMetadata eklendi
} from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../hooks/useToast";

/**
 * Tasks sayfası, kullanıcının görevlerini yönetebileceği ana arayüzü sağlar.
 * Bu sayfa, görevleri listeler, yeni görevler oluşturmaya, mevcut görevleri düzenlemeye ve silmeye olanak tanır.
 * Ayrıca, görev ilerlemesini güncelleyebilir ve kategoriye göre filtreleme yapabilir.
 * React Query kütüphanesi, API çağrılarının ve durum yönetiminin verimli bir şekilde yapılmasını sağlar.
 */
const Tasks: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<TodoTaskDto | null>(null);
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

  // Görevleri çekmek için React Query kullanımı
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery<
    ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>,
    Error,
    ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>,
    (string | number | null)[]
  >({
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
    }) => tasksAPI.updateTaskProgress(data.taskId, data.updateProgressDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("Görev ilerlemesi güncellendi.");
    },
    onError: (error) => {
      showError(
        `Görev ilerlemesi güncellenirken hata oluştu: ${error.message}`
      );
    },
  });

  const handleOpenModal = (task?: TodoTaskDto) => {
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
        // isCompleted burada kullanılmıyor, form state'inden kaldırıldı.
      });
    } else {
      setCurrentTask(null);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Low",
        categoryId: undefined,
        // isCompleted burada kullanılmıyor, form state'inden kaldırıldı.
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
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
      ...taskForm,
      dueDate: taskForm.dueDate
        ? new Date(taskForm.dueDate).toISOString()
        : undefined,
      categoryId: taskForm.categoryId || undefined,
    };

    if (currentTask) {
      updateTaskMutation.mutate({
        id: currentTask.id,
        ...taskData,
      } as UpdateTodoTaskDto & { id: number });
    } else {
      createTaskMutation.mutate(taskData as CreateTodoTaskDto);
    }
  };

  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value === "" ? null : e.target.value);
    setPage(1);
  };

  const handleToggleComplete = (taskId: number, isCompleted: boolean) => {
    const updateProgressDto: UpdateTaskProgressDto = {
      progress: isCompleted ? 100 : 0,
    };
    updateTaskProgressMutation.mutate({ taskId, updateProgressDto });
  };

  const confirmDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowConfirmModal(true);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete);
    }
  };

  if (isLoadingTasks || isLoadingCategories) {
    return <LoadingSpinner />;
  }

  if (tasksError) {
    return (
      <div className="text-red-500">
        Görevler yüklenirken hata oluştu: {tasksError.message}
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="text-red-500">
        Kategoriler yüklenirken hata oluştu: {categoriesError.message}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasksData?.data.tasks.map((task: TodoTaskDto) => (
          <Card
            key={task.id}
            className="p-4 shadow-md dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {task.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {task.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Son Tarih:{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "Yok"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Öncelik: {task.priority}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kategori: {task.categoryName || "Yok"}
            </p>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() =>
                  handleToggleComplete(task.id, !task.isCompleted)
                }
                className="mr-2"
              />
              <label className="text-gray-700 dark:text-gray-300">
                Tamamlandı
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => handleOpenModal(task)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3"
              >
                Düzenle
              </Button>
              <Button
                onClick={() => confirmDelete(task.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3"
              >
                Sil
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
          {Math.ceil((tasksData?.data.pagination?.totalCount || 0) / pageSize)}
        </span>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={
            page * pageSize >= (tasksData?.data.pagination?.totalCount || 0)
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

      {isModalOpen && (
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
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasks;
