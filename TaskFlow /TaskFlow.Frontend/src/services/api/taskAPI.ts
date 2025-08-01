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
} from "../../types/task.types";

/**
 * Task Management API
 */
export const taskAPI = {
  // CRUD operations
  getTasks: (filter?: TodoTaskFilterDto): Promise<ApiResponse<TasksResponse>> =>
    apiClient.get<ApiResponse<TasksResponse>>("/todotasks", { params: filter }).then(res => res.data),

  getTaskById: (id: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.get<ApiResponse<TodoTaskDto>>(`/todotasks/${id}`).then(res => res.data),

  createTask: (taskData: CreateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.post<ApiResponse<TodoTaskDto>>("/todotasks", taskData).then(res => res.data),

  updateTask: (id: number, taskData: UpdateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.put<ApiResponse<TodoTaskDto>>(`/todotasks/${id}`, taskData).then(res => res.data),

  deleteTask: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/todotasks/${id}`).then(res => res.data),

  // Task completion and progress
  completeTask: (id: number, isCompleted: boolean): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/todotasks/${id}/complete`,
      { isCompleted } as CompleteTaskDto
    ).then(res => res.data),

  updateTaskProgress: (id: number, progress: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/todotasks/${id}/progress`,
      { completionPercentage: progress }
    ).then(res => res.data),

  // Bulk operations
  bulkDeleteTasks: (data: BulkDeleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/todotasks/bulk-delete", data).then(res => res.data),

  bulkCompleteTasks: (data: BulkCompleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/todotasks/bulk-complete", data).then(res => res.data),
}; 