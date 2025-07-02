/**
 * Tasks Slice - TaskFlow
 *
 * Görev state'ini yönetir.
 * CRUD operations, filtering, search ve task management.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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

// Tasks State Interface
interface TasksState {
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
  loadingStates: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    completing: boolean;
  };

  // Error States
  error: string | null;
  lastError: string | null;

  // Cache
  lastFetch: string | null;
  cacheExpiry: number; // milliseconds

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

// Initial State
const initialState: TasksState = {
  // Task Lists
  tasks: [],
  currentTask: null,

  // Filtering & Search
  filter: {
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortAscending: false,
  },
  searchTerm: "",

  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  // Loading States
  loading: false,
  loadingStates: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
    completing: false,
  },

  // Error States
  error: null,
  lastError: null,

  // Cache
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  // UI States
  selectedTaskIds: [],
  viewMode:
    (localStorage.getItem("taskflow-view-mode") as
      | "list"
      | "grid"
      | "kanban") || "list",

  // Statistics
  stats: null,

  // Quick Access Lists
  todayTasks: [],
  overdueTasks: [],
  favoriteTasks: [],
};

// Async Thunks (API calls will be added later)
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filter: TaskFilter = {}, { rejectWithValue }) => {
    try {
      // TODO: API call implementation
      console.log("Fetching tasks with filter:", filter);

      // Mock response for now
      return {
        tasks: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görevler yüklenirken hata oluştu";
      return rejectWithValue(message);
    }
  }
);

// Tasks Slice
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Filter & Search Actions
    setFilter: (state, action: PayloadAction<Partial<TaskFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },

    resetFilter: (state) => {
      state.filter = {
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortAscending: false,
      };
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filter.searchText = action.payload;
      state.filter.page = 1; // Reset to first page
    },

    clearSearch: (state) => {
      state.searchTerm = "";
      delete state.filter.searchText;
    },

    // View Mode Actions
    setViewMode: (state, action: PayloadAction<"list" | "grid" | "kanban">) => {
      state.viewMode = action.payload;
      localStorage.setItem("taskflow-view-mode", action.payload);
    },

    // Selection Actions
    selectTask: (state, action: PayloadAction<number>) => {
      if (!state.selectedTaskIds.includes(action.payload)) {
        state.selectedTaskIds.push(action.payload);
      }
    },

    deselectTask: (state, action: PayloadAction<number>) => {
      state.selectedTaskIds = state.selectedTaskIds.filter(
        (id) => id !== action.payload
      );
    },

    selectAllTasks: (state) => {
      state.selectedTaskIds = state.tasks.map((task) => task.id);
    },

    clearSelection: (state) => {
      state.selectedTaskIds = [];
    },

    // Current Task Actions
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },

    clearCurrentTask: (state) => {
      state.currentTask = null;
    },

    // Task Actions (optimistic updates)
    addTaskOptimistic: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },

    updateTaskOptimistic: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<Task> }>
    ) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }

      // Update current task if it's the same
      if (state.currentTask && state.currentTask.id === id) {
        state.currentTask = { ...state.currentTask, ...updates };
      }
    },

    removeTaskOptimistic: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);

      // Clear current task if it was deleted
      if (state.currentTask && state.currentTask.id === action.payload) {
        state.currentTask = null;
      }

      // Remove from selection
      state.selectedTaskIds = state.selectedTaskIds.filter(
        (id) => id !== action.payload
      );
    },

    // Quick Complete Toggle
    toggleTaskComplete: (state, action: PayloadAction<number>) => {
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === action.payload
      );

      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex];
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted
          ? new Date().toISOString()
          : undefined;
        task.completionPercentage = task.isCompleted ? 100 : 0;
      }
    },

    // Loading States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setLoadingState: (
      state,
      action: PayloadAction<{
        key: keyof TasksState["loadingStates"];
        loading: boolean;
      }>
    ) => {
      const { key, loading } = action.payload;
      state.loadingStates[key] = loading;
    },

    // Error Actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.lastError = action.payload;
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    // Cache Management
    markAsFetched: (state) => {
      state.lastFetch = new Date().toISOString();
    },

    invalidateCache: (state) => {
      state.lastFetch = null;
    },

    // Statistics
    setStats: (state, action: PayloadAction<TaskStats>) => {
      state.stats = action.payload;
    },

    // Quick Access Lists
    setTodayTasks: (state, action: PayloadAction<Task[]>) => {
      state.todayTasks = action.payload;
    },

    setOverdueTasks: (state, action: PayloadAction<Task[]>) => {
      state.overdueTasks = action.payload;
    },

    setFavoriteTasks: (state, action: PayloadAction<Task[]>) => {
      state.favoriteTasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loadingStates.fetching = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loadingStates.fetching = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loadingStates.fetching = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  // Filter & Search
  setFilter,
  resetFilter,
  setSearchTerm,
  clearSearch,

  // View Mode
  setViewMode,

  // Selection
  selectTask,
  deselectTask,
  selectAllTasks,
  clearSelection,

  // Current Task
  setCurrentTask,
  clearCurrentTask,

  // Task Management
  addTaskOptimistic,
  updateTaskOptimistic,
  removeTaskOptimistic,
  toggleTaskComplete,

  // Loading
  setLoading,
  setLoadingState,

  // Error
  setError,
  clearError,

  // Cache
  markAsFetched,
  invalidateCache,

  // Statistics
  setStats,

  // Quick Access
  setTodayTasks,
  setOverdueTasks,
  setFavoriteTasks,
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks;
export const selectTasksList = (state: { tasks: TasksState }) =>
  state.tasks.tasks;
export const selectCurrentTask = (state: { tasks: TasksState }) =>
  state.tasks.currentTask;
export const selectTasksFilter = (state: { tasks: TasksState }) =>
  state.tasks.filter;
export const selectTasksLoading = (state: { tasks: TasksState }) =>
  state.tasks.loading;
export const selectTasksError = (state: { tasks: TasksState }) =>
  state.tasks.error;
export const selectSelectedTaskIds = (state: { tasks: TasksState }) =>
  state.tasks.selectedTaskIds;
export const selectViewMode = (state: { tasks: TasksState }) =>
  state.tasks.viewMode;
export const selectTasksPagination = (state: { tasks: TasksState }) =>
  state.tasks.pagination;
export const selectTasksStats = (state: { tasks: TasksState }) =>
  state.tasks.stats;

// Computed Selectors
export const selectSelectedTasks = (state: { tasks: TasksState }) => {
  const { tasks, selectedTaskIds } = state.tasks;
  return tasks.filter((task) => selectedTaskIds.includes(task.id));
};

export const selectTaskById = (
  state: { tasks: TasksState },
  taskId: number
) => {
  return state.tasks.tasks.find((task) => task.id === taskId);
};

export const selectCompletedTasks = (state: { tasks: TasksState }) => {
  return state.tasks.tasks.filter((task) => task.isCompleted);
};

export const selectPendingTasks = (state: { tasks: TasksState }) => {
  return state.tasks.tasks.filter((task) => !task.isCompleted);
};

export default tasksSlice.reducer;
