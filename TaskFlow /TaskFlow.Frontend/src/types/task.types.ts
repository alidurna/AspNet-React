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
  priority: number; // 0: Low, 1: Normal, 2: High, 3: Critical
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
  priority: number; // 0: Low, 1: Normal, 2: High, 3: Critical
  categoryId: number; // Changed from optional to required to match backend
  parentTaskId?: number;
  completionPercentage?: number; // Added to match backend
  reminderDate?: string; // Added to match backend
  startDate?: string; // Added to match backend
  tags?: string; // Added to match backend
  notes?: string; // Added to match backend
}

export interface UpdateTodoTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: number; // 0: Low, 1: Normal, 2: High, 3: Critical
  categoryId?: number;
  parentTaskId?: number;
}

export interface TasksResponse {
  tasks: TodoTaskDto[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TodoTaskFilterDto {
  SearchText?: string; // Changed from searchQuery to match backend
  CategoryId?: number;
  Priority?: string; // Changed from number to string to match backend
  DueDateFrom?: string; // Changed from dueDateStart to match backend
  DueDateTo?: string; // Changed from dueDateEnd to match backend
  IsCompleted?: boolean; // Changed from isCompleted to match backend
  IncludeSubTasks?: boolean; // Changed from includeSubTasks to match backend
  SortBy?: string; // Changed from sortBy to match backend
  SortAscending?: boolean; // Changed from sortOrder to match backend
  Page?: number; // Changed from pageNumber to match backend
  PageSize?: number; // Changed from pageSize to match backend
}

export interface TaskStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
} 