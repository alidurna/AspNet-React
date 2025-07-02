/**
 * Redux Store Configuration - TaskFlow
 *
 * Redux Toolkit kullanarak merkezi state yönetimi konfigürasyonu.
 * Tüm slice'ları combine eder ve store'u oluşturur.
 */

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

// Slice'ları import et
import authSlice from "./slices/authSlice";
import tasksSlice from "./slices/tasksSlice";
import uiSlice from "./slices/uiSlice";
import categoriesSlice from "./slices/categoriesSlice";

/**
 * Redux Store Konfigürasyonu
 */
export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: tasksSlice,
    categories: categoriesSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date objelerini ignore et (createAsyncThunk'larda kullanılıyor)
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["items.dates"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
