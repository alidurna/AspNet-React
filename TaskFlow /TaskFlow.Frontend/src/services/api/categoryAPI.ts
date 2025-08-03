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
} from "../../types/tasks/category.types";

/**
 * Category Management API
 */
export const categoryAPI = {
  getCategories: (filter?: CategoryFilterDto): Promise<ApiResponse<CategoryDto[]>> =>
    apiClient.get<ApiResponse<CategoryDto[]>>("/v1/Categories", { params: filter }).then(res => res.data),

  getCategoryById: (id: number): Promise<ApiResponse<CategoryDto>> =>
    apiClient.get<ApiResponse<CategoryDto>>(`/v1/Categories/${id}`).then(res => res.data),

  createCategory: (categoryData: CreateCategoryDto): Promise<ApiResponse<CategoryDto>> =>
    apiClient.post<ApiResponse<CategoryDto>>("/v1/Categories", categoryData).then(res => res.data),

  updateCategory: (id: number, categoryData: UpdateCategoryDto): Promise<ApiResponse<CategoryDto>> =>
    apiClient.put<ApiResponse<CategoryDto>>(`/v1/Categories/${id}`, categoryData).then(res => res.data),

  deleteCategory: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/v1/Categories/${id}`).then(res => res.data),
}; 