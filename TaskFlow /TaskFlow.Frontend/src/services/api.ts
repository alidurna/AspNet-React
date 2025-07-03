/**
 * API Service - TaskFlow Frontend
 *
 * Bu dosya, backend API ile iletişim kurmak için kullanılan
 * merkezi API service'ini içerir.
 *
 * Özellikler:
 * - Axios HTTP client konfigürasyonu
 * - JWT token yönetimi
 * - Request/Response interceptor'ları
 * - Error handling
 * - API endpoint'leri
 *
 * Backend API Base URL: https://localhost:7047/api
 *
 * Endpoint'ler:
 * - POST /auth/login - Kullanıcı girişi
 * - POST /auth/register - Kullanıcı kaydı
 * - GET /users/profile - Kullanıcı profili
 * - GET/POST/PUT/DELETE /tasks - Görev işlemleri
 * - GET/POST/PUT/DELETE /categories - Kategori işlemleri
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
 */
const API_BASE_URL = "https://localhost:7172/api/v1.0";

/**
 * Axios Instance Oluşturma
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
 */
export const tokenManager = {
  /**
   * Token'ı localStorage'a kaydet
   */
  setToken: (token: string): void => {
    localStorage.setItem("taskflow_token", token);
  },

  /**
   * Token'ı localStorage'dan al
   */
  getToken: (): string | null => {
    return localStorage.getItem("taskflow_token");
  },

  /**
   * Token'ı localStorage'dan sil
   */
  removeToken: (): void => {
    localStorage.removeItem("taskflow_token");
  },

  /**
   * Token'ın geçerli olup olmadığını kontrol et
   */
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      // JWT token'ın payload kısmını decode et
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Token'ın süresi dolmuş mu?
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};

/**
 * Request Interceptor
 *
 * Her API isteğinden önce çalışır.
 * JWT token'ı otomatik olarak header'a ekler.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();

    if (token && tokenManager.isTokenValid()) {
      // Authorization header'ına JWT token ekle
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request'i console'a log et (development için)
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
 * Her API yanıtından sonra çalışır.
 * Error handling ve token yenileme işlemleri.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Response'u console'a log et (development için)
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

    // 401 Unauthorized - Token geçersiz
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      // Login sayfasına yönlendir
      window.location.href = "/login";
    }

    // 403 Forbidden - Yetkisiz erişim
    if (error.response?.status === 403) {
      console.error("Access denied");
    }

    // 500 Server Error
    if (error.response?.status >= 500) {
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API Service
 *
 * Kullanıcı girişi, kaydı ve profil işlemleri
 */
export const authAPI = {
  /**
   * Kullanıcı Girişi
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/users/login",
        credentials
      );

      // Başarılı giriş sonrası token'ı kaydet
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
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/users/register",
        userData
      );

      // Başarılı kayıt sonrası token'ı kaydet
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
      // Backend'e logout isteği gönder (opsiyonel)
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Token'ı her durumda sil
      tokenManager.removeToken();
    }
  },

  /**
   * Kullanıcı Profili Al
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

  /**
   * Kullanıcı Profili Güncelle
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<{ success: boolean; data: User }>(
        "/users/profile",
        userData
      );
      return response.data.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil güncellenemedi";
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
