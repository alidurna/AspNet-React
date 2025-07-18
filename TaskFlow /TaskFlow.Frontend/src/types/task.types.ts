export interface BulkDeleteTaskDto {
  taskIds: number[];
}

export interface BulkCompleteTaskDto {
  taskIds: number[];
}

export interface TodoTaskDto {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601 formatında tarih
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "InProgress" | "Completed" | "Cancelled";
  isCompleted: boolean;
  progress: number; // 0-100 arası
  categoryId?: number;
  categoryName?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  parentTaskId?: number;
  subTasks?: TodoTaskDto[]; // Alt görevler
  creatorUserName?: string; // Oluşturan kullanıcının adı
  assignedUserName?: string; // Atanan kullanıcının adı
}

export interface CreateTodoTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  categoryId?: number;
  parentTaskId?: number;
}

export interface UpdateTodoTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Todo" | "InProgress" | "Completed" | "Cancelled";
  categoryId?: number;
  parentTaskId?: number;
}

export interface TodoTaskFilterDto {
  searchQuery?: string;
  categoryId?: number;
  priority?: "Low" | "Medium" | "High";
  status?: "Todo" | "InProgress" | "Completed" | "Cancelled";
  dueDateStart?: string; // ISO 8601
  dueDateEnd?: string; // ISO 8601
  isCompleted?: boolean;
  includeSubTasks?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface TaskStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
} 