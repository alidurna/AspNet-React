/**
 * UI Slice - TaskFlow
 *
 * Global UI state'ini yönetir.
 * Toast notifications, loading states, modal controls ve theme yönetimi.
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Toast Types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  persistent?: boolean;
}

// Theme Types
export type ThemeMode = "light" | "dark" | "system";

// Modal Types
export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
}

// UI State Interface
interface UIState {
  // Theme
  theme: ThemeMode;
  isDarkMode: boolean;

  // Loading States
  globalLoading: boolean;
  pageLoading: boolean;
  componentLoading: { [key: string]: boolean };

  // Toast Notifications
  toasts: Toast[];

  // Modals
  modal: ModalState;

  // Sidebar & Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Error States
  globalError: string | null;

  // Network Status
  isOnline: boolean;

  // Page Meta
  pageTitle: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
}

// Initial State
const initialState: UIState = {
  // Theme
  theme: (localStorage.getItem("taskflow-theme") as ThemeMode) || "system",
  isDarkMode: false,

  // Loading States
  globalLoading: false,
  pageLoading: false,
  componentLoading: {},

  // Toast Notifications
  toasts: [],

  // Modals
  modal: {
    isOpen: false,
    type: null,
    data: undefined,
  },

  // Sidebar & Layout
  sidebarOpen: true,
  sidebarCollapsed: false,

  // Error States
  globalError: null,

  // Network Status
  isOnline: navigator.onLine,

  // Page Meta
  pageTitle: "TaskFlow",
  breadcrumbs: [],
};

// UI Slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Theme Actions
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem("taskflow-theme", action.payload);
    },

    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },

    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      localStorage.setItem("taskflow-theme", newTheme);
    },

    // Loading Actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },

    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },

    setComponentLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.componentLoading[key] = true;
      } else {
        delete state.componentLoading[key];
      }
    },

    // Toast Actions
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.toasts.push(toast);
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },

    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Quick toast helpers
    showSuccessToast: (state, action: PayloadAction<string>) => {
      // Aynı mesaj zaten varsa ekleme
      const existingToast = state.toasts.find(t => t.message === action.payload && t.type === "success");
      if (existingToast) {
        return;
      }
      
      const toast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: action.payload,
        type: "success",
        duration: 4000,
      };
      // Eski toast'ları temizle (maksimum 3 toast tut)
      if (state.toasts.length >= 3) {
        state.toasts = state.toasts.slice(-2);
      }
      state.toasts.push(toast);
    },

    showErrorToast: (state, action: PayloadAction<string>) => {
      // Aynı mesaj zaten varsa ekleme
      const existingToast = state.toasts.find(t => t.message === action.payload && t.type === "error");
      if (existingToast) {
        return;
      }
      
      const toast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: action.payload,
        type: "error",
        duration: 6000,
      };
      // Eski toast'ları temizle (maksimum 3 toast tut)
      if (state.toasts.length >= 3) {
        state.toasts = state.toasts.slice(-2);
      }
      state.toasts.push(toast);
    },

    showWarningToast: (state, action: PayloadAction<string>) => {
      // Aynı mesaj zaten varsa ekleme
      const existingToast = state.toasts.find(t => t.message === action.payload && t.type === "warning");
      if (existingToast) {
        return;
      }
      
      const toast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: action.payload,
        type: "warning",
        duration: 5000,
      };
      // Eski toast'ları temizle (maksimum 3 toast tut)
      if (state.toasts.length >= 3) {
        state.toasts = state.toasts.slice(-2);
      }
      state.toasts.push(toast);
    },

    showInfoToast: (state, action: PayloadAction<string>) => {
      // Aynı mesaj zaten varsa ekleme
      const existingToast = state.toasts.find(t => t.message === action.payload && t.type === "info");
      if (existingToast) {
        return;
      }
      
      const toast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: action.payload,
        type: "info",
        duration: 4000,
      };
      // Eski toast'ları temizle (maksimum 3 toast tut)
      if (state.toasts.length >= 3) {
        state.toasts = state.toasts.slice(-2);
      }
      state.toasts.push(toast);
    },

    // Modal Actions
    openModal: (
      state,
      action: PayloadAction<{ type: string; data?: unknown }>
    ) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },

    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: undefined,
      };
    },

    // Sidebar Actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Error Actions
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },

    clearGlobalError: (state) => {
      state.globalError = null;
    },

    // Network Status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Page Meta Actions
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
      document.title = `${action.payload} - TaskFlow`;
    },

    setBreadcrumbs: (
      state,
      action: PayloadAction<Array<{ label: string; path?: string }>>
    ) => {
      state.breadcrumbs = action.payload;
    },

    addBreadcrumb: (
      state,
      action: PayloadAction<{ label: string; path?: string }>
    ) => {
      state.breadcrumbs.push(action.payload);
    },

    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
  },
});

// Actions
export const {
  // Theme
  setTheme,
  setDarkMode,
  toggleTheme,

  // Loading
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,

  // Toast
  addToast,
  removeToast,
  clearAllToasts,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,

  // Modal
  openModal,
  closeModal,

  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,

  // Error
  setGlobalError,
  clearGlobalError,

  // Network
  setOnlineStatus,

  // Page Meta
  setPageTitle,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectIsDarkMode = (state: { ui: UIState }) => state.ui.isDarkMode;
export const selectGlobalLoading = (state: { ui: UIState }) =>
  state.ui.globalLoading;
export const selectPageLoading = (state: { ui: UIState }) =>
  state.ui.pageLoading;
export const selectComponentLoading = (state: { ui: UIState }) =>
  state.ui.componentLoading;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectSidebarOpen = (state: { ui: UIState }) =>
  state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }) =>
  state.ui.sidebarCollapsed;
export const selectGlobalError = (state: { ui: UIState }) =>
  state.ui.globalError;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle;
export const selectBreadcrumbs = (state: { ui: UIState }) =>
  state.ui.breadcrumbs;

export default uiSlice.reducer;
