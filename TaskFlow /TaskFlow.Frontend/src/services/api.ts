/**
 * api.ts
 *
 * Tüm backend API iletişimini yöneten merkezi servis dosyasıdır.
 * - Axios ile HTTP istekleri
 * - JWT token yönetimi
 * - Request/Response interceptor'ları
 * - Hata yönetimi
 * - Auth, kullanıcı, görev, kategori gibi endpoint fonksiyonları
 *
 * Tüm frontend uygulamasında API çağrıları bu dosya üzerinden yapılır.
 */

import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/auth.types";

/**
 * API Base Configuration
 *
 * Tüm istekler bu base URL üzerinden yönlendirilir.
 */
const API_BASE_URL = "/api";

/**
 * Axios Instance Oluşturma
 *
 * API isteklerinde kullanılacak global axios instance'ı.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Token Yönetimi Utility'leri
 *
 * JWT token'ı localStorage'da saklama, okuma ve silme işlemleri.
 */
export const tokenManager = {
  setToken: (token: string): void => {
    localStorage.setItem("taskflow_token", token);
  },
  getToken: (): string | null => {
    return localStorage.getItem("taskflow_token");
  },
  removeToken: (): void => {
    localStorage.removeItem("taskflow_token");
  },
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};

/**
 * Request Interceptor
 *
 * Her API isteğinden önce JWT token'ı header'a ekler ve istekleri loglar.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token && tokenManager.isTokenValid()) {
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
 *
 * Her API yanıtından sonra hata yönetimi ve token geçersizliğini kontrol eder.
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
  (error) => {
    console.error("❌ Response Error:", error);
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      console.error("Access denied");
    }
    if (error.response?.status >= 500) {
      console.error("Server error occurred");
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Service
 *
 * Kullanıcı girişi, kaydı, çıkışı ve profil işlemleri için fonksiyonlar.
 */
export const authAPI = {
  /**
   * Kullanıcı Girişi
   * @param credentials LoginRequest
   * @returns AuthResponse
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/users/login",
        credentials
      );
      if (response.data.success && response.data.data?.token) {
        tokenManager.setToken(response.data.data.token);
      }
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Giriş işlemi başarısız";
      throw new Error(message);
    }
  },
  /**
   * Kullanıcı Kaydı
   * @param userData RegisterRequest
   * @returns AuthResponse
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/users/register",
        userData
      );
      if (response.data.success && response.data.data?.token) {
        tokenManager.setToken(response.data.data.token);
      }
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kayıt işlemi başarısız";
      throw new Error(message);
    }
  },
  /**
   * Kullanıcı Çıkışı
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      tokenManager.removeToken();
    }
  },
  /**
   * Kullanıcı Profili Al
   * @returns User
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        "/users/profile"
      );
      return response.data.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil bilgileri alınamadı";
      throw new Error(message);
    }
  },
};

// API Response Type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  createdAt: string;
  lastLoginAt?: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
  };
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile API
export const profileAPI = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>(
        "/users/profile"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil bilgileri alınamadı";
      throw new Error(message);
    }
  },

  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>(
        "/users/profile",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil güncellenemedi";
      throw new Error(message);
    }
  },

  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        "/users/change-password",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Şifre değiştirilemedi";
      throw new Error(message);
    }
  },

  uploadProfileImage: async (
    file: File
  ): Promise<ApiResponse<{ imageUrl: string }>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
        "/users/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil fotoğrafı yüklenemedi";
      throw new Error(message);
    }
  },
};

/**
 * Tasks API Service (Future Implementation)
 *
 * Görev yönetimi işlemleri
 */
export const tasksAPI = {
  // TODO: Task API endpoint'leri implementasyonu
  // getTasks: async () => {},
  // createTask: async () => {},
  // updateTask: async () => {},
  // deleteTask: async () => {},
};

/**
 * Categories API Service (Future Implementation)
 *
 * Kategori yönetimi işlemleri
 */
export const categoriesAPI = {
  // TODO: Category API endpoint'leri implementasyonu
  // getCategories: async () => {},
  // createCategory: async () => {},
  // updateCategory: async () => {},
  // deleteCategory: async () => {},
};

/**
 * Default Export - Ana API Client
 */
export default apiClient;
