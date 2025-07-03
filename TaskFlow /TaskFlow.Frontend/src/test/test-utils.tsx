// Test utilities for React Testing Library
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import { store } from "../store";

// Redux store slices
import tasksReducer from "../store/slices/tasksSlice";
import authReducer from "../store/slices/authSlice";
import categoriesReducer from "../store/slices/categoriesSlice";
import uiReducer from "../store/slices/uiSlice";

// Test store oluşturma fonksiyonu
const createTestStore = (initialState: Record<string, unknown> = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
      auth: authReducer,
      categories: categoriesReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Redux Provider wrapper component
interface TestProviderProps {
  children: React.ReactNode;
  initialState?: Record<string, unknown>;
  store?: ReturnType<typeof createTestStore>;
}

const TestProvider: React.FC<TestProviderProps> = ({
  children,
  initialState = {},
  store = createTestStore(initialState),
}) => {
  return <Provider store={store}>{children}</Provider>;
};

// Custom render function Redux Provider ile
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialState?: Record<string, unknown>;
  store?: ReturnType<typeof createTestStore>;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialState, store, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProvider initialState={initialState} store={store}>
      {children}
    </TestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock fetch implementation
export const mockFetch = () => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: "Success" }),
      text: () => Promise.resolve("Success"),
    })
  ) as unknown as typeof fetch;
};

// Clean up after each test
export const cleanupMocks = () => {
  vi.clearAllMocks();
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };
export { TestProvider, createTestStore };

// Mock'lar
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

// Common test utilities
export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  email: "test@example.com",
  name: "Test User",
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTask = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: "Test Task",
  description: "Test Description",
  priority: "Medium",
  status: "Todo",
  categoryId: 1,
  userId: 1,
  dueDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCategory = (
  overrides: Record<string, unknown> = {}
) => ({
  id: 1,
  name: "Test Category",
  colorCode: "#3B82F6",
  userId: 1,
  createdAt: new Date().toISOString(),
  ...overrides,
});
