/**
 * Categories Page - Refactored
 * 
 * Kategori yönetimi sayfası. Modüler sub-components kullanır.
 */

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

// Sub-components
import CategoriesHeader from "./components/CategoriesHeader";
import CategoryCard from "./components/CategoryCard";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import ConfirmModal from "../components/ui/ConfirmModal";

/**
 * Categories Page - Refactored
 */
const Categories: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CreateCategoryDto | UpdateCategoryDto>({
    name: "",
    description: "",
    colorCode: "",
  });

  // Data fetching
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse<CategoryDto[]>, Error>({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getCategories(),
  });

  // Mutations
  const createCategoryMutation = useMutation<ApiResponse<CategoryDto>, Error, CreateCategoryDto>({
    mutationFn: categoriesAPI.createCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(response.message || "Kategori başarıyla oluşturuldu!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false);
        setCategoryForm({ name: "", description: "", colorCode: "" });
      } else {
        toast.showError(response.message || "Kategori oluşturulurken bir hata oluştu.");
      }
    },
    onError: (err) => {
      toast.showError(err.message || "Kategori oluşturulurken bir hata oluştu.");
    },
  });

  const updateCategoryMutation = useMutation<ApiResponse<CategoryDto>, Error, { id: number; data: UpdateCategoryDto }>({
    mutationFn: ({ id, data }) => categoriesAPI.updateCategory(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(response.message || "Kategori başarıyla güncellendi!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false);
        setEditingCategory(null);
      } else {
        toast.showError(response.message || "Kategori güncellenirken bir hata oluştu.");
      }
    },
    onError: (err) => {
      toast.showError(err.message || "Kategori güncellenirken bir hata oluştu.");
    },
  });

  const deleteCategoryMutation = useMutation<ApiResponse<void>, Error, number>({
    mutationFn: categoriesAPI.deleteCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(response.message || "Kategori başarıyla silindi!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.showError(response.message || "Kategori silinirken bir hata oluştu.");
      }
    },
    onError: (err) => {
      toast.showError(err.message || "Kategori silinirken bir hata oluştu.");
    },
  });

  // Event handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", colorCode: "" });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CategoryDto) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      colorCode: category.colorCode || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsConfirmModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: categoryForm as UpdateCategoryDto,
      });
    } else {
      createCategoryMutation.mutate(categoryForm as CreateCategoryDto);
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete);
      setIsConfirmModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const categories = categoriesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600">
            {error?.message || "Kategoriler yüklenirken bir hata oluştu."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CategoriesHeader
        onAddCategory={handleAddCategory}
        categoriesCount={categories.length}
      />

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Henüz kategori yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            İlk kategorinizi oluşturmak için "Yeni Kategori" butonuna tıklayın.
          </p>
          <Button onClick={handleAddCategory}>
            Yeni Kategori Ekle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Kategori Adı"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              
              <Input
                label="Açıklama"
                value={categoryForm.description || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
              
              <Input
                label="Renk Kodu"
                type="color"
                value={categoryForm.colorCode || "#3B82F6"}
                onChange={(e) => setCategoryForm({ ...categoryForm, colorCode: e.target.value })}
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="flex-1"
                >
                  {editingCategory ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Kategori Sil"
        message="Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmButtonText="Sil"
        cancelButtonText="İptal"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

export default Categories;
