/**
 * Categories Slice - TaskFlow
 *
 * Kategori state'ini yönetir.
 * CRUD operations, category stats ve category management.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Category Types (backend ile uyumlu)
export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;

  // Computed/Relations
  taskCount?: number;
  completedTaskCount?: number;
  completionRate?: number;
}

// Category Stats
export interface CategoryStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  lastActivity?: string;
}

// Categories State Interface
interface CategoriesState {
  // Category Lists
  categories: Category[];
  currentCategory: Category | null;

  // Loading States
  loading: boolean;
  loadingStates: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Error States
  error: string | null;
  lastError: string | null;

  // Cache
  lastFetch: string | null;
  cacheExpiry: number; // milliseconds

  // UI States
  selectedCategoryIds: number[];

  // Statistics
  categoryStats: { [categoryId: number]: CategoryStats };

  // Quick Access
  activeCategoriesOnly: boolean;
}

// Initial State
const initialState: CategoriesState = {
  // Category Lists
  categories: [],
  currentCategory: null,

  // Loading States
  loading: false,
  loadingStates: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  },

  // Error States
  error: null,
  lastError: null,

  // Cache
  lastFetch: null,
  cacheExpiry: 10 * 60 * 1000, // 10 minutes (categories change less frequently)

  // UI States
  selectedCategoryIds: [],

  // Statistics
  categoryStats: {},

  // Quick Access
  activeCategoriesOnly: true,
};

// Async Thunks (API calls will be added later)
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (includeInactive: boolean = false, { rejectWithValue }) => {
    try {
      // TODO: API call implementation
      console.log("Fetching categories, includeInactive:", includeInactive);

      // Mock response for now
      return [];
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategoriler yüklenirken hata oluştu";
      return rejectWithValue(message);
    }
  }
);

// Categories Slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Selection Actions
    selectCategory: (state, action: PayloadAction<number>) => {
      if (!state.selectedCategoryIds.includes(action.payload)) {
        state.selectedCategoryIds.push(action.payload);
      }
    },

    deselectCategory: (state, action: PayloadAction<number>) => {
      state.selectedCategoryIds = state.selectedCategoryIds.filter(
        (id) => id !== action.payload
      );
    },

    clearCategorySelection: (state) => {
      state.selectedCategoryIds = [];
    },

    // Current Category Actions
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },

    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },

    // Category Actions (optimistic updates)
    addCategoryOptimistic: (state, action: PayloadAction<Category>) => {
      state.categories.unshift(action.payload);
    },

    updateCategoryOptimistic: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<Category> }>
    ) => {
      const { id, updates } = action.payload;
      const categoryIndex = state.categories.findIndex(
        (category) => category.id === id
      );

      if (categoryIndex !== -1) {
        state.categories[categoryIndex] = {
          ...state.categories[categoryIndex],
          ...updates,
        };
      }

      // Update current category if it's the same
      if (state.currentCategory && state.currentCategory.id === id) {
        state.currentCategory = { ...state.currentCategory, ...updates };
      }
    },

    removeCategoryOptimistic: (state, action: PayloadAction<number>) => {
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload
      );

      // Clear current category if it was deleted
      if (
        state.currentCategory &&
        state.currentCategory.id === action.payload
      ) {
        state.currentCategory = null;
      }

      // Remove from selection
      state.selectedCategoryIds = state.selectedCategoryIds.filter(
        (id) => id !== action.payload
      );

      // Remove stats
      delete state.categoryStats[action.payload];
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
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loadingStates.fetching = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loadingStates.fetching = false;
        state.categories = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loadingStates.fetching = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  // Selection
  selectCategory,
  deselectCategory,
  clearCategorySelection,

  // Current Category
  setCurrentCategory,
  clearCurrentCategory,

  // Category Management
  addCategoryOptimistic,
  updateCategoryOptimistic,
  removeCategoryOptimistic,

  // Error
  setError,
  clearError,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state: { categories: CategoriesState }) =>
  state.categories;
export const selectCategoriesList = (state: { categories: CategoriesState }) =>
  state.categories.categories;
export const selectCurrentCategory = (state: { categories: CategoriesState }) =>
  state.categories.currentCategory;
export const selectCategoriesLoading = (state: {
  categories: CategoriesState;
}) => state.categories.loading;
export const selectCategoriesError = (state: { categories: CategoriesState }) =>
  state.categories.error;

export default categoriesSlice.reducer;
