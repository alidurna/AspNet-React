/**
 * Advanced Search Modal Component
 * Multi-criteria search and filtering for tasks
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFilterSchema } from "../../schemas/taskSchemas";
import { z } from "zod";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

type SearchFilters = z.infer<typeof taskFilterSchema>;

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialFilters = {},
}) => {
  const [searchMode, setSearchMode] = useState<"basic" | "advanced">("basic");
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SearchFilters>({
    resolver: zodResolver(taskFilterSchema),
    defaultValues: {
      searchText: "",
      priority: "",
      categoryId: undefined,
      isCompleted: undefined,
      dueDateFrom: "",
      dueDateTo: "",
      onlyParentTasks: false,
      sortBy: "createdAt",
      sortAscending: false,
      page: 1,
      pageSize: 20,
      ...initialFilters,
    },
  });

  // Mock data - bu veriler gerçek API'den gelecek
  const categories = [
    { id: 1, name: "İş", color: "#3b82f6" },
    { id: 2, name: "Kişisel", color: "#10b981" },
    { id: 3, name: "Proje", color: "#f59e0b" },
  ];

  const priorities = [
    { value: "Low", label: "Düşük", color: "#10b981" },
    { value: "Normal", label: "Normal", color: "#3b82f6" },
    { value: "High", label: "Yüksek", color: "#f59e0b" },
    { value: "Critical", label: "Kritik", color: "#ef4444" },
  ];

  const savedSearches = [
    {
      id: 1,
      name: "Bugün Bitenler",
      filters: { dueDateTo: new Date().toISOString().split("T")[0] },
    },
    { id: 2, name: "Yüksek Öncelikli", filters: { priority: "High" } },
    {
      id: 3,
      name: "Tamamlanmamış İş Görevleri",
      filters: { categoryId: 1, isCompleted: false },
    },
  ];

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Handle form submission
  const onSubmit = (data: SearchFilters) => {
    // Clean up empty values
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    ) as SearchFilters;

    onSearch(cleanedData);
    onClose();
  };

  // Reset form
  const handleReset = () => {
    reset();
  };

  // Save current search
  const handleSaveSearch = () => {
    const searchName = prompt("Arama adı:");
    if (searchName) {
      // Bu gerçek implementasyonda API'ye kaydedilecek
      console.log("Saving search:", searchName, watchedValues);
      alert("Arama kaydedildi!");
    }
  };

  // Load saved search
  const handleLoadSavedSearch = (filters: Partial<SearchFilters>) => {
    Object.entries(filters).forEach(([key, value]) => {
      setValue(key as keyof SearchFilters, value);
    });
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gelişmiş Arama</h2>
              <p className="text-blue-100 mt-1">
                Görevlerinizi detaylı kriterlere göre filtreleyin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search Mode Tabs */}
          <div className="flex mt-4">
            <button
              onClick={() => setSearchMode("basic")}
              className={`px-4 py-2 rounded-lg mr-2 transition-colors ${
                searchMode === "basic"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              Temel Arama
            </button>
            <button
              onClick={() => setSearchMode("advanced")}
              className={`px-4 py-2 rounded-lg mr-2 transition-colors ${
                searchMode === "advanced"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              Gelişmiş Arama
            </button>
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors"
            >
              Kayıtlı Aramalar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Saved Searches */}
          {showSavedSearches && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Kayıtlı Aramalar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {savedSearches.map((saved) => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => handleLoadSavedSearch(saved.filters)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <span className="text-sm font-medium">{saved.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Text */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama Metni
              </label>
              <input
                {...register("searchText")}
                type="text"
                placeholder="Görev başlığı veya açıklamasında ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.searchText && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.searchText.message}
                </p>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                {...register("categoryId", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öncelik
              </label>
              <select
                {...register("priority")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Öncelikler</option>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                {...register("isCompleted", {
                  setValueAs: (value: string) =>
                    value === "" ? undefined : value === "true",
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Görevler</option>
                <option value="false">Tamamlanmamış</option>
                <option value="true">Tamamlanmış</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {searchMode === "advanced" && (
              <>
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    {...register("dueDateFrom")}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    {...register("dueDateTo")}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.dueDateTo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dueDateTo.message}
                    </p>
                  )}
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıralama
                  </label>
                  <select
                    {...register("sortBy")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt">Oluşturma Tarihi</option>
                    <option value="updatedAt">Güncelleme Tarihi</option>
                    <option value="dueDate">Bitiş Tarihi</option>
                    <option value="priority">Öncelik</option>
                    <option value="title">Başlık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıralama Yönü
                  </label>
                  <select
                    {...register("sortAscending", {
                      setValueAs: (value: string) => value === "true",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="false">Azalan (Z-A, Yeni-Eski)</option>
                    <option value="true">Artan (A-Z, Eski-Yeni)</option>
                  </select>
                </div>

                {/* Additional Options */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        {...register("onlyParentTasks")}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Sadece ana görevleri göster
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={handleSaveSearch}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Aramayı Kaydet
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ara
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
