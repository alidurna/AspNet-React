// ****************************************************************************************************
//  DEPENDENCYAPI.TS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow frontend uygulamasının görev bağımlılıkları API entegrasyonunu sağlar.
//  Backend'deki TaskDependenciesController ile iletişim kurar.
//
//  ANA BAŞLIKLAR:
//  - CRUD Operations (Create, Read, Update, Delete)
//  - Dependency Analysis
//  - Filtering ve Pagination
//  - Error Handling
//  - Type Safety
//
//  GÜVENLİK:
//  - JWT token authentication
//  - Request/response validation
//  - Error boundary handling
//  - Data sanitization
//
//  HATA YÖNETİMİ:
//  - Network error handling
//  - API error responses
//  - Timeout handling
//  - Retry logic
//
//  EDGE-CASE'LER:
//  - Network connectivity issues
//  - Invalid response data
//  - Circular dependencies
//  - Large dependency chains
//
//  YAN ETKİLER:
//  - Cache invalidation
//  - Real-time updates
//  - UI state management
//  - Optimistic updates
//
//  PERFORMANS:
//  - Request caching
//  - Debounced requests
//  - Optimized queries
//  - Batch operations
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear API structure
//  - Comprehensive documentation
//  - Type safety
//  - Extensible design
// ****************************************************************************************************

import { apiClient, type ApiResponse } from './apiClient';

// Type definitions for dependency-related data
export interface TaskDependencyDto {
  id: number;
  dependentTaskId: number;
  dependentTaskTitle: string;
  prerequisiteTaskId: number;
  prerequisiteTaskTitle: string;
  dependencyType: DependencyType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userId: number;
  userName: string;
  isBlocked: boolean;
  canStart: boolean;
  isPrerequisiteCompleted: boolean;
}

export interface CreateTaskDependencyDto {
  dependentTaskId: number;
  prerequisiteTaskId: number;
  dependencyType: DependencyType;
  description?: string;
}

export interface UpdateTaskDependencyDto {
  dependencyType?: DependencyType;
  description?: string;
  isActive?: boolean;
}

export interface TaskDependencyFilterDto {
  dependentTaskId?: number;
  prerequisiteTaskId?: number;
  dependencyType?: DependencyType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
}

export enum DependencyType {
  FinishToStart = 0,  // Önceki görev bitmeden sonraki başlayamaz
  StartToStart = 1,   // Önceki görev başlamadan sonraki başlayamaz
  FinishToFinish = 2, // Önceki görev bitmeden sonraki bitemez
  StartToFinish = 3   // Önceki görev başlamadan sonraki bitemez
}

export interface DependenciesResponse {
  dependencies: TaskDependencyDto[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Task Dependency API
 * 
 * Görev bağımlılıkları yönetimi ile ilgili API endpoints.
 */
export const dependencyAPI = {
  // CRUD operations
  getDependencies: (filter?: TaskDependencyFilterDto): Promise<ApiResponse<DependenciesResponse>> =>
    apiClient.get<ApiResponse<DependenciesResponse>>("/v1/TaskDependencies", { params: filter }).then(res => res.data),

  getDependencyById: (id: number): Promise<ApiResponse<TaskDependencyDto>> =>
    apiClient.get<ApiResponse<TaskDependencyDto>>(`/v1/TaskDependencies/${id}`).then(res => res.data),

  createDependency: (dependencyData: CreateTaskDependencyDto): Promise<ApiResponse<TaskDependencyDto>> =>
    apiClient.post<ApiResponse<TaskDependencyDto>>("/v1/TaskDependencies", dependencyData).then(res => res.data),

  updateDependency: (id: number, dependencyData: UpdateTaskDependencyDto): Promise<ApiResponse<TaskDependencyDto>> =>
    apiClient.put<ApiResponse<TaskDependencyDto>>(`/v1/TaskDependencies/${id}`, dependencyData).then(res => res.data),

  deleteDependency: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/v1/TaskDependencies/${id}`).then(res => res.data),

  // Analysis operations
  getTaskDependencies: (taskId: number): Promise<ApiResponse<TaskDependencyDto[]>> =>
    apiClient.get<ApiResponse<TaskDependencyDto[]>>(`/v1/TaskDependencies/task/${taskId}/dependencies`).then(res => res.data),

  getTaskPrerequisites: (taskId: number): Promise<ApiResponse<TaskDependencyDto[]>> =>
    apiClient.get<ApiResponse<TaskDependencyDto[]>>(`/v1/TaskDependencies/task/${taskId}/prerequisites`).then(res => res.data),

  isTaskBlocked: (taskId: number): Promise<ApiResponse<boolean>> =>
    apiClient.get<ApiResponse<boolean>>(`/v1/TaskDependencies/task/${taskId}/is-blocked`).then(res => res.data),

  canTaskStart: (taskId: number): Promise<ApiResponse<boolean>> =>
    apiClient.get<ApiResponse<boolean>>(`/v1/TaskDependencies/task/${taskId}/can-start`).then(res => res.data),
}; 