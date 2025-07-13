import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoriesAPI,
  type CategoryDto,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ConfirmModal from "../components/ui/ConfirmModal";

const Categories: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<
    CreateCategoryDto | UpdateCategoryDto
  >({
    name: "",
    description: "",
    colorCode: "",
  });

  // Kategorileri çekme
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse<CategoryDto[]>, Error>({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getCategories(), // queryFn doğru şekilde sarıldı
  });

  // Kategori oluşturma mutasyonu
  const createCategoryMutation = useMutation<
    ApiResponse<CategoryDto>,
    Error,
    CreateCategoryDto
  >({
    mutationFn: categoriesAPI.createCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(
          response.message || "Kategori başarıyla oluşturuldu!"
        );
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false);
        setCategoryForm({ name: "", description: "", colorCode: "" });
      } else {
        toast.showError(
          response.message || "Kategori oluşturulurken bir hata oluştu."
        );
      }
    },
    onError: (err) => {
      toast.showError(
        err.message || "Kategori oluşturulurken bir hata oluştu."
      );
    },
  });

  // Kategori güncelleme mutasyonu
  const updateCategoryMutation = useMutation<
    ApiResponse<CategoryDto>,
    Error,
    { id: number; data: UpdateCategoryDto }
  >({
    mutationFn: ({ id, data }) => categoriesAPI.updateCategory(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(
          response.message || "Kategori başarıyla güncellendi!"
        );
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "", colorCode: "" });
      } else {
        toast.showError(
          response.message || "Kategori güncellenirken bir hata oluştu."
        );
      }
    },
    onError: (err) => {
      toast.showError(
        err.message || "Kategori güncellenirken bir hata oluştu."
      );
    },
  });

  // Kategori silme mutasyonu
  const deleteCategoryMutation = useMutation<
    ApiResponse<object>,
    Error,
    number
  >({
    mutationFn: categoriesAPI.deleteCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(response.message || "Kategori başarıyla silindi!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
      } else {
        toast.showError(
          response.message || "Kategori silinirken bir hata oluştu."
        );
      }
    },
    onError: (err) => {
      toast.showError(err.message || "Kategori silinirken bir hata oluştu.");
    },
  });

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", colorCode: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryDto) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      colorCode: category.colorCode || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", colorCode: "" });
  };

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: categoryForm,
      });
    } else {
      createCategoryMutation.mutate(categoryForm as CreateCategoryDto);
    }
  };

  const handleOpenConfirmDeleteModal = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete !== null) {
      deleteCategoryMutation.mutate(categoryToDelete);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setCategoryToDelete(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Kategoriler"
        breadcrumbs={[{ name: "Kategoriler" }]}
      >
        <div className="flex justify-center items-center h-64">
          <p>Kategoriler yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout
        title="Kategoriler"
        breadcrumbs={[{ name: "Kategoriler" }]}
      >
        <div className="text-red-600 text-center py-8">
          Kategoriler yüklenirken bir hata oluştu: {error?.message}
        </div>
      </DashboardLayout>
    );
  }

  const categories = categoriesResponse?.data || []; // data.data yerine data kullanıldı

  return (
    <DashboardLayout
      title="Kategoriler"
      breadcrumbs={[{ name: "Kategoriler" }]}
    >
      <div className="flex justify-end mb-6">
        <Button onClick={handleOpenCreateModal} variant="primary">
          Yeni Kategori Ekle
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Henüz bir kategori oluşturmadınız. İlk kategorinizi oluşturmak için
            "Yeni Kategori Ekle" butonuna tıklayın.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(
            (
              category: CategoryDto // category parametresine tip atandı
            ) => (
              <Card
                key={category.id}
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center mb-3">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: category.colorCode || "#9ca3af",
                      }}
                    ></span>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description || "Açıklama yok"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Görev Sayısı: {category.taskCount}
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={() => handleOpenEditModal(category)}
                    variant="secondary"
                    size="sm"
                  >
                    Düzenle
                  </Button>
                  <Button
                    onClick={() => handleOpenConfirmDeleteModal(category.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Sil
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Create/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}
            </h2>
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <Input
                label="Kategori Adı"
                id="categoryName"
                name="name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
              />
              <Input
                label="Açıklama (Opsiyonel)"
                id="categoryDescription"
                name="description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />
              <Input
                label="Renk Kodu (Opsiyonel, örn: #FF0000 veya blue)"
                id="categoryColorCode"
                name="colorCode"
                value={categoryForm.colorCode}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    colorCode: e.target.value,
                  })
                }
              />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {editingCategory ? "Kaydet" : "Oluştur"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Kategori Silme Onayı"
        message="Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye bağlı tüm görevler 'Genel' kategorisine taşınacaktır."
        confirmButtonText="Evet, Sil"
        cancelButtonText="İptal Et"
      />
    </DashboardLayout>
  );
};

export default Categories;
