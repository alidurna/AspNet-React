/**
 * API Client - Base Configuration
 * 
 * Axios base client, interceptors ve token management utilities.
 */

import axios from "axios";

/**
 * Genel API Yanıt Modeli
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

/**
 * Base API Client Configuration
 */
import { environment } from "../../config/environment";

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Token Management Utilities
 */
export const tokenManager = {
  setToken: (token: string, persist: boolean = true): void => {
    console.log("🔧 setToken called with persist:", persist);
    if (persist) {
      localStorage.setItem("taskflow_token", token);
      sessionStorage.removeItem("taskflow_token");
      console.log("💾 Token saved to localStorage");
    } else {
      sessionStorage.setItem("taskflow_token", token);
      localStorage.removeItem("taskflow_token");
      console.log("💾 Token saved to sessionStorage");
    }
  },
  getToken: (): string | null => {
    const localToken = localStorage.getItem("taskflow_token");
    const sessionToken = sessionStorage.getItem("taskflow_token");
    const token = localToken || sessionToken;
    console.log("🔍 getToken - localStorage:", !!localToken, "sessionStorage:", !!sessionToken, "returning:", !!token);
    return token;
  },
  removeToken: (): void => {
    console.log("🗑️ Removing token from both storages");
    localStorage.removeItem("taskflow_token");
    sessionStorage.removeItem("taskflow_token");
  },
  setRefreshToken: (refreshToken: string, persist: boolean = true): void => {
    console.log("🔧 setRefreshToken called with persist:", persist);
    if (persist) {
      localStorage.setItem("taskflow_refresh_token", refreshToken);
      sessionStorage.removeItem("taskflow_refresh_token");
      console.log("💾 Refresh token saved to localStorage");
    } else {
      sessionStorage.setItem("taskflow_refresh_token", refreshToken);
      localStorage.removeItem("taskflow_refresh_token");
      console.log("💾 Refresh token saved to sessionStorage");
    }
  },
  getRefreshToken: (): string | null => {
    const localToken = localStorage.getItem("taskflow_refresh_token");
    const sessionToken = sessionStorage.getItem("taskflow_refresh_token");
    const token = localToken || sessionToken;
    console.log("🔍 getRefreshToken - localStorage:", !!localToken, "sessionStorage:", !!sessionToken, "returning:", !!token);
    return token;
  },
  removeRefreshToken: (): void => {
    console.log("🗑️ Removing refresh token from both storages");
    localStorage.removeItem("taskflow_refresh_token");
    sessionStorage.removeItem("taskflow_refresh_token");
  },
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      console.log("🔍 Token validation - exp:", payload.exp, "current:", currentTime, "valid:", isValid);
      return isValid;
    } catch {
      console.log("🔍 Token validation failed - invalid token format");
      return false;
    }
  },
};

// Yetkilendirme hatası callback
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

/**
 * Request Interceptor
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 */
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          console.log("🔄 Attempting token refresh...");
          const response = await axios.post(
            `${environment.apiBaseUrl}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            const rememberMe = !!localStorage.getItem("taskflow_token");
            
            tokenManager.setToken(accessToken, rememberMe);
            tokenManager.setRefreshToken(newRefreshToken, rememberMe);
            
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            console.log("✅ Token refreshed successfully");
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          tokenManager.removeToken();
          tokenManager.removeRefreshToken();
          
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
        }
      } else {
        console.log("❌ No refresh token available");
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
    }

    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
); 