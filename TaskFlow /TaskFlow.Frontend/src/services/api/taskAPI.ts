/**
 * Task API
 * 
 * Görev yönetimi ile ilgili API endpoints.
 */

import { apiClient, type ApiResponse } from './apiClient';
import type {
  BulkDeleteTaskDto,
  BulkCompleteTaskDto,
  TodoTaskDto,
  UpdateTodoTaskDto,
  CreateTodoTaskDto,
  TodoTaskFilterDto,
  TasksResponse,
  CompleteTaskDto,
} from "../../types/tasks/task.types";

/**
 * Task Management API
 */
export const taskAPI = {
  // CRUD operations
  getTasks: (filter?: TodoTaskFilterDto): Promise<ApiResponse<TasksResponse>> =>
    apiClient.get<ApiResponse<TasksResponse>>("/api/v1.0/TodoTasks", { params: filter }).then(res => res.data),

  getTaskById: (id: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.get<ApiResponse<TodoTaskDto>>(`/api/v1.0/TodoTasks/${id}`).then(res => res.data),

  createTask: (taskData: CreateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.post<ApiResponse<TodoTaskDto>>("/api/v1.0/TodoTasks", taskData).then(res => res.data),

  // Alt görevler için - backend'deki özel endpoint'i kullanıyoruz
  createSubTask: (parentId: number, taskData: CreateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.post<ApiResponse<TodoTaskDto>>(`/api/v1.0/TodoTasks/${parentId}/subtasks`, taskData).then(res => res.data),

  // Alt görevleri getir
  getSubTasks: (parentId: number): Promise<ApiResponse<TodoTaskDto[]>> =>
    apiClient.get<ApiResponse<TodoTaskDto[]>>(`/api/v1.0/TodoTasks/${parentId}/subtasks`).then(res => res.data),

  updateTask: (id: number, taskData: UpdateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.put<ApiResponse<TodoTaskDto>>(`/api/v1.0/TodoTasks/${id}`, taskData).then(res => res.data),

  deleteTask: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/api/v1.0/TodoTasks/${id}`).then(res => res.data),

  // Task completion and progress
  completeTask: (id: number, isCompleted: boolean): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/api/v1.0/TodoTasks/${id}/complete`,
      { isCompleted } as CompleteTaskDto
    ).then(res => res.data),

  updateTaskProgress: (id: number, progress: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/api/v1.0/TodoTasks/${id}/progress`,
      { completionPercentage: progress }
    ).then(res => res.data),

  // Bulk operations
  bulkDeleteTasks: (data: BulkDeleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/api/v1.0/TodoTasks/bulk-delete", data).then(res => res.data),

  bulkCompleteTasks: (data: BulkCompleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/api/v1.0/TodoTasks/bulk-complete", data).then(res => res.data),
}; 