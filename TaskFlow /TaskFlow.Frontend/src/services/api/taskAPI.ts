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
    apiClient.get<ApiResponse<TasksResponse>>("/v1/TodoTasks", { params: filter }).then(res => res.data),

  getTaskById: (id: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.get<ApiResponse<TodoTaskDto>>(`/v1/TodoTasks/${id}`).then(res => res.data),

  createTask: (taskData: CreateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.post<ApiResponse<TodoTaskDto>>("/v1/TodoTasks", taskData).then(res => res.data),

  updateTask: (id: number, taskData: UpdateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.put<ApiResponse<TodoTaskDto>>(`/v1/TodoTasks/${id}`, taskData).then(res => res.data),

  deleteTask: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/v1/TodoTasks/${id}`).then(res => res.data),

  // Task completion and progress
  completeTask: (id: number, isCompleted: boolean): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/v1/TodoTasks/${id}/complete`,
      { isCompleted } as CompleteTaskDto
    ).then(res => res.data),

  updateTaskProgress: (id: number, progress: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/v1/TodoTasks/${id}/progress`,
      { completionPercentage: progress }
    ).then(res => res.data),

  // Bulk operations
  bulkDeleteTasks: (data: BulkDeleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/TodoTasks/bulk-delete", data).then(res => res.data),

  bulkCompleteTasks: (data: BulkCompleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/TodoTasks/bulk-complete", data).then(res => res.data),
}; 