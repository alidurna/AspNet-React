/**
 * Task Types - TaskFlow
 * 
 * Task state management için kullanılan type definitions.
 */

// Task Types (backend ile uyumlu)
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "Low" | "Normal" | "High" | "Critical";
  dueDate?: string;
  reminderDate?: string;
  startDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  completionPercentage: number;
  tags?: string;
  notes?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isFavorite: boolean;
  userId: number;
  categoryId: number;
  parentTaskId?: number;

  // Relations
  category?: {
    id: number;
    name: string;
    color: string;
  };
  parentTask?: {
    id: number;
    title: string;
  };
  subTasks?: Task[];
}

// Filter Types
export interface TaskFilter {
  page?: number;
  pageSize?: number;
  isCompleted?: boolean;
  categoryId?: number;
  priority?: string;
  searchText?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  onlyParentTasks?: boolean;
  sortBy?: string;
  sortAscending?: boolean;
}

// Pagination Info
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Task Stats
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  thisWeekTasks: number;
  completionRate: number;
}

// Loading States
export interface TaskLoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  completing: boolean;
}

// Tasks State Interface
export interface TasksState {
  // Task Lists
  tasks: Task[];
  currentTask: Task | null;

  // Filtering & Search
  filter: TaskFilter;
  searchTerm: string;

  // Pagination
  pagination: PaginationInfo;

  // Loading States
  loading: boolean;
  loadingStates: TaskLoadingStates;

  // Error States
  error: string | null;
  lastError: string | null;

  // Cache
  lastFetch: number | null;
  cacheExpiry: number;

  // UI States
  selectedTaskIds: number[];
  viewMode: "list" | "grid" | "kanban";

  // Statistics
  stats: TaskStats | null;

  // Quick Access Lists
  todayTasks: Task[];
  overdueTasks: Task[];
  favoriteTasks: Task[];
}

// API Response Types
export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

// Task Creation/Update Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Task['priority'];
  dueDate?: string;
  reminderDate?: string;
  startDate?: string;
  categoryId: number;
  parentTaskId?: number;
  tags?: string;
  notes?: string;
  estimatedMinutes?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: number;
  completionPercentage?: number;
  isCompleted?: boolean;
  isFavorite?: boolean;
} 