/**
 * Tasks Slice - TaskFlow (Refactored)
 *
 * Basitleştirilmiş görev state management.
 * Type definitions ayrı dosyaya taşındı.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { 
  Task, 
  TaskFilter, 
  TasksState, 
  TasksResponse, 
  CreateTaskRequest, 
  UpdateTaskRequest 
} from "../types/taskTypes";

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

// Async Thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filter: TaskFilter = {}, { rejectWithValue }) => {
    try {
      // Real API implementation will be added when backend is connected
      // For now, return empty mock data
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

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData: CreateTaskRequest, { rejectWithValue }) => {
    try {
      // Mock implementation
      const newTask: Task = {
        id: Date.now(),
        ...taskData,
        isCompleted: false,
        completionPercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isFavorite: false,
        userId: 1, // Mock user ID
      };
      return newTask;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev oluşturulurken hata oluştu";
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (taskData: UpdateTaskRequest, { rejectWithValue }) => {
    try {
      // Mock implementation
      return taskData;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev güncellenirken hata oluştu";
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId: number, { rejectWithValue }) => {
    try {
      // Mock implementation
      return taskId;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev silinirken hata oluştu";
      return rejectWithValue(message);
    }
  }
);

// Tasks Slice
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Filter & Search
    setFilter: (state, action: PayloadAction<Partial<TaskFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    clearFilters: (state) => {
      state.filter = initialState.filter;
      state.searchTerm = "";
    },

    // Task Selection
    selectTask: (state, action: PayloadAction<number>) => {
      const taskId = action.payload;
      if (!state.selectedTaskIds.includes(taskId)) {
        state.selectedTaskIds.push(taskId);
      }
    },
    deselectTask: (state, action: PayloadAction<number>) => {
      state.selectedTaskIds = state.selectedTaskIds.filter(
        (id) => id !== action.payload
      );
    },
    clearSelection: (state) => {
      state.selectedTaskIds = [];
    },
    selectAllTasks: (state) => {
      state.selectedTaskIds = state.tasks.map((task) => task.id);
    },

    // View Mode
    setViewMode: (state, action: PayloadAction<"list" | "grid" | "kanban">) => {
      state.viewMode = action.payload;
      localStorage.setItem("taskflow-view-mode", action.payload);
    },

    // Current Task
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },

    // Error Handling
    clearError: (state) => {
      state.error = null;
    },

    // Cache Management
    invalidateCache: (state) => {
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.loadingStates.fetching = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingStates.fetching = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.lastFetch = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.loadingStates.fetching = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loadingStates.creating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loadingStates.creating = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loadingStates.creating = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loadingStates.updating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loadingStates.updating = false;
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loadingStates.updating = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loadingStates.deleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loadingStates.deleting = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        state.selectedTaskIds = state.selectedTaskIds.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loadingStates.deleting = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setFilter,
  setSearchTerm,
  clearFilters,
  selectTask,
  deselectTask,
  clearSelection,
  selectAllTasks,
  setViewMode,
  setCurrentTask,
  clearError,
  invalidateCache,
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;
export const selectCurrentTask = (state: { tasks: TasksState }) => state.tasks.currentTask;
export const selectTasksLoading = (state: { tasks: TasksState }) => state.tasks.loading;
export const selectTasksError = (state: { tasks: TasksState }) => state.tasks.error;
export const selectSelectedTaskIds = (state: { tasks: TasksState }) => state.tasks.selectedTaskIds;
export const selectViewMode = (state: { tasks: TasksState }) => state.tasks.viewMode;
export const selectTaskFilter = (state: { tasks: TasksState }) => state.tasks.filter;
export const selectSearchTerm = (state: { tasks: TasksState }) => state.tasks.searchTerm;
export const selectPagination = (state: { tasks: TasksState }) => state.tasks.pagination;

// Computed Selectors
export const selectCompletedTasks = (state: { tasks: TasksState }) =>
  state.tasks.tasks.filter((task) => task.isCompleted);

export const selectPendingTasks = (state: { tasks: TasksState }) =>
  state.tasks.tasks.filter((task) => !task.isCompleted);

export const selectFavoriteTasks = (state: { tasks: TasksState }) =>
  state.tasks.tasks.filter((task) => task.isFavorite);

export const selectTasksByCategory = (state: { tasks: TasksState }, categoryId: number) =>
  state.tasks.tasks.filter((task) => task.categoryId === categoryId);

export default tasksSlice.reducer;
