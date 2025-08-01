/**
 * Category API
 * 
 * Kategori yönetimi ile ilgili API endpoints.
 */

import { apiClient, type ApiResponse } from './apiClient';
import type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
} from "../../types/category.types";

/**
 * Category Management API
 */
export const categoryAPI = {
  getCategories: (filter?: CategoryFilterDto): Promise<ApiResponse<CategoryDto[]>> =>
    apiClient.get<ApiResponse<CategoryDto[]>>("/categories", { params: filter }).then(res => res.data),

  getCategoryById: (id: number): Promise<ApiResponse<CategoryDto>> =>
    apiClient.get<ApiResponse<CategoryDto>>(`/categories/${id}`).then(res => res.data),

  createCategory: (categoryData: CreateCategoryDto): Promise<ApiResponse<CategoryDto>> =>
    apiClient.post<ApiResponse<CategoryDto>>("/categories", categoryData).then(res => res.data),

  updateCategory: (id: number, categoryData: UpdateCategoryDto): Promise<ApiResponse<CategoryDto>> =>
    apiClient.put<ApiResponse<CategoryDto>>(`/categories/${id}`, categoryData).then(res => res.data),

  deleteCategory: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/categories/${id}`).then(res => res.data),
}; 