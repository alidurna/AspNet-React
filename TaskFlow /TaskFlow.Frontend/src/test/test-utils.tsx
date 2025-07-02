/**
 * Test Utilities - TaskFlow
 * 
 * Custom render functions ve test helpers.
 * Redux store ile entegre testing utilities.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

// Import slices
import authSlice from '../store/slices/authSlice';
import tasksSlice from '../store/slices/tasksSlice';
import uiSlice from '../store/slices/uiSlice';
import categoriesSlice from '../store/slices/categoriesSlice';

// Custom render function with Redux store
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authSlice,
        tasks: tasksSlice,
        categories: categoriesSlice,
        ui: uiSlice,
      },
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Set up router history
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Mock User Data
 */
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+905551234567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock Category Data
 */
export const mockCategory = {
  id: 1,
  name: 'Test Category',
  description: 'Test description',
  color: '#3B82F6',
  icon: 'folder',
  isActive: true,
  userId: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  taskCount: 5,
  completedTaskCount: 3,
  completionRate: 60,
};

/**
 * Mock Task Data
 */
export const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test task description',
  priority: 'Normal' as const,
  dueDate: '2024-12-31T23:59:59Z',
  reminderDate: '2024-12-30T23:59:59Z',
  startDate: '2024-01-01T00:00:00Z',
  isCompleted: false,
  completedAt: undefined,
  completionPercentage: 0,
  tags: 'test,sample',
  notes: 'Test notes',
  estimatedMinutes: 120,
  actualMinutes: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
  isFavorite: false,
  userId: 1,
  categoryId: 1,
  parentTaskId: undefined,
  category: mockCategory,
  parentTask: undefined,
  subTasks: [],
};

/**
 * Mock API Response
 */
export const mockApiResponse = {
  success: true,
  message: 'Operation successful',
  data: null,
  errors: [],
  timestamp: '2024-01-01T00:00:00Z',
};

/**
 * Create Mock Store with Initial State
 */
export function createMockStore(initialState: any = {}) {
  return configureStore({
    reducer: {
      auth: authSlice,
      tasks: tasksSlice,
      categories: categoriesSlice,
      ui: uiSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastLoginTime: null,
      },
      tasks: {
        tasks: [],
        currentTask: null,
        filter: {
          page: 1,
          pageSize: 20,
          sortBy: 'createdAt',
          sortAscending: false,
        },
        searchTerm: '',
        pagination: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        loading: false,
        loadingStates: {
          fetching: false,
          creating: false,
          updating: false,
          deleting: false,
          completing: false,
        },
        error: null,
        lastError: null,
        lastFetch: null,
        cacheExpiry: 5 * 60 * 1000,
        selectedTaskIds: [],
        viewMode: 'list',
        stats: null,
        todayTasks: [],
        overdueTasks: [],
        favoriteTasks: [],
      },
      categories: {
        categories: [],
        currentCategory: null,
        loading: false,
        loadingStates: {
          fetching: false,
          creating: false,
          updating: false,
          deleting: false,
        },
        error: null,
        lastError: null,
        lastFetch: null,
        cacheExpiry: 10 * 60 * 1000,
        selectedCategoryIds: [],
        categoryStats: {},
        activeCategoriesOnly: true,
      },
      ui: {
        theme: 'light',
        isDarkMode: false,
        globalLoading: false,
        pageLoading: false,
        componentLoading: {},
        toasts: [],
        modal: {
          isOpen: false,
          type: null,
          data: undefined,
        },
        sidebarOpen: true,
        sidebarCollapsed: false,
        globalError: null,
        isOnline: true,
        pageTitle: 'TaskFlow',
        breadcrumbs: [],
      },
      ...initialState,
    },
  });
}

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock fetch function
 */
export const mockFetch = (response: any, ok: boolean = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
};

/**
 * Clear all mocks
 */
export const clearAllMocks = () => {
  vi.clearAllMocks();
  
  // Clear localStorage mock
  (window.localStorage.getItem as any).mockClear();
  (window.localStorage.setItem as any).mockClear();
  (window.localStorage.removeItem as any).mockClear();
  (window.localStorage.clear as any).mockClear();
  
  // Clear sessionStorage mock
  (window.sessionStorage.getItem as any).mockClear();
  (window.sessionStorage.setItem as any).mockClear();
  (window.sessionStorage.removeItem as any).mockClear();
  (window.sessionStorage.clear as any).mockClear();
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
} 