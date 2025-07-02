/**
 * Auth Slice - TaskFlow
 *
 * Kullanıcı authentication state'ini yönetir.
 * Login, logout, register işlemleri ve user bilgilerini tutar.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authAPI, tokenManager } from "../../services/api";
import type {
  User,
  LoginRequest,
  RegisterRequest,
} from "../../types/auth.types";

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginTime: string | null;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginTime: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.data?.user) {
        return {
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        return rejectWithValue(response.message || "Giriş işlemi başarısız");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Giriş işlemi başarısız";
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);

      if (response.success && response.data?.user) {
        return {
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        return rejectWithValue(response.message || "Kayıt işlemi başarısız");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kayıt işlemi başarısız";
      return rejectWithValue(message);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenManager.getToken();

      if (!token || !tokenManager.isTokenValid()) {
        throw new Error("Token geçersiz");
      }

      // Token geçerliyse user bilgilerini al
      // const userResponse = await authAPI.getCurrentUser();
      // return userResponse;

      // Şimdilik token'dan user bilgilerini decode edelim
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
      } as User;
    } catch (error) {
      tokenManager.removeToken();
      const message =
        error instanceof Error ? error.message : "Token doğrulama başarısız";
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // Backend'e logout isteği (opsiyonel)
      await authAPI.logout().catch(() => {
        // Logout API hatası önemsiz değil, devam et
      });
    } catch (error) {
      // Logout sırasında hata olsa bile local state'i temizle
      console.error("Logout error:", error);
    } finally {
      // Token'ı temizle
      tokenManager.removeToken();

      // State'i sıfırla
      dispatch(authSlice.actions.resetAuthState());
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Auth state'ini sıfırla
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginTime = null;
    },

    // Error'u temizle
    clearError: (state) => {
      state.error = null;
    },

    // User bilgilerini güncelle
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Login attempt sayısını artır
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },

    // Login attempt sayısını sıfırla
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

// Actions
export const {
  resetAuthState,
  clearError,
  updateUser,
  incrementLoginAttempts,
  resetLoginAttempts,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
