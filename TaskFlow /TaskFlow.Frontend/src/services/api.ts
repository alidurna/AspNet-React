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
  EmailVerificationRequest,
  EmailVerification,
  PasswordResetRequestDto,
  PasswordResetDto,
  ChangePasswordRequest,
  UserProfile,
  UpdateProfileRequest,
  UserStatsDto,
  TwoFactorStatus,
  Enable2FARequest,
  Enable2FAResponse,
  Verify2FARequest,
  Disable2FARequest,
  RecoveryCodesResponse,
  CaptchaConfig,
  CaptchaVerification,
  Login2FARequest,
  LoginRecoveryRequest,
} from "../types/auth.types";

import type { AttachmentDto, UploadLimitsDto } from "../types/file.types";
import type {
  BulkDeleteTaskDto,
  BulkCompleteTaskDto,
  TodoTaskDto,
  UpdateTodoTaskDto,
  CreateTodoTaskDto,
  TodoTaskFilterDto,
} from "../types/task.types";
import type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
} from "../types/category.types";
import type { SearchSuggestionsResponse } from "../types/search.types";

/**
 * Genel API Yanıt Modeli
 *
 * Backend'den dönen tüm API yanıtları için standartlaştırılmış yapı.
 * Bu, `success`, `message` ve `data` alanlarını içerir.
 *
 * @template T - Başarılı yanıt durumunda `data` alanının beklenen veri tipi.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[]; // Hata durumunda detaylı hata mesajları
}

/**
 * API Base Configuration
 *
 * Tüm istekler bu base URL üzerinden yönlendirilir.
 */
const API_BASE_URL = "/api"; // Frontend, istekleri Vite proxy'sine göndermeli

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

// Yetkilendirme hatası durumunda çağrılacak callback fonksiyonu
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

/**
 * Request Interceptor
 *
 * Her API isteğinden önce JWT token'ı header'a ekler ve istekleri loglar.
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor
 *
 * Her API yanıtından sonra hata yönetimi ve token geçersizliğini kontrol eder.
 * 401 Unauthorized hatası alındığında JWT token yenileme mekanizmasını tetikler.
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

    // Token süresi dolduğunda veya geçersiz olduğunda (401 Unauthorized) ve henüz yeniden token almıyorsak
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Eğer zaten bir yenileme isteği devam ediyorsa, mevcut isteği sıraya al
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/users/refresh-token`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            }
          );

          if (response.data.success && response.data.data?.token) {
            const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            tokenManager.setToken(newAccessToken);
            tokenManager.setRefreshToken(newRefreshToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } else {
            // Refresh token geçersiz veya başka bir hata
            processQueue(error, null);
            tokenManager.removeToken();
            tokenManager.removeRefreshToken();
            if (onUnauthorizedCallback) onUnauthorizedCallback(); // Callback'i çağır
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          processQueue(refreshError, null);
          tokenManager.removeToken();
          tokenManager.removeRefreshToken();
          if (onUnauthorizedCallback) onUnauthorizedCallback(); // Callback'i çağır
        } finally {
          isRefreshing = false;
        }
      } else {
        // Refresh token yok, logout yap
        console.log("Refresh token yok, yetkisiz erişim callback'i çağrılıyor.");
        tokenManager.removeToken();
        tokenManager.removeRefreshToken();
        if (onUnauthorizedCallback) onUnauthorizedCallback(); // Callback'i çağır
      }
    }
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API Endpoint'leri
 *
 * Her bir servis alanı (auth, user, task, category) için ayrı API metodları.
 */

// AUTHENTICATION API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", credentials).then(res => res.data),

  register: (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    ).then(res => res.data),

  logout: (): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/logout").then(res => res.data),

  requestEmailVerification: (emailData: EmailVerificationRequest): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/email-verification-request", emailData).then(res => res.data),

  verifyEmail: (verificationData: EmailVerification): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/verify-email", verificationData).then(res => res.data),

  requestPasswordReset: (data: PasswordResetRequestDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/password-reset-request", data).then(res => res.data),

  resetPassword: (data: PasswordResetDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/reset-password", data).then(res => res.data),

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<object>> =>
    apiClient.put<ApiResponse<object>>("/auth/change-password", data).then(res => res.data),

  socialLogin: (data: { provider: string; token: string; userData: any }): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/social-login", data).then(res => res.data),

  // 2FA login
  loginWith2FA: (data: Login2FARequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login-2fa", data).then(res => res.data),

  // Recovery code ile login
  loginWithRecoveryCode: (data: LoginRecoveryRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login-recovery", data).then(res => res.data),
};

// USER API
export const profileAPI = {
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get<ApiResponse<UserProfile>>("/v1.0/users/profile").then(res => res.data),

  updateProfile: (userData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> =>
    apiClient.put<ApiResponse<UserProfile>>(
      "/v1.0/users/profile",
      userData
    ).then(res => res.data),

  getUserStats: (): Promise<ApiResponse<UserStatsDto>> =>
    apiClient.get<ApiResponse<UserStatsDto>>("/v1.0/users/statistics").then(res => res.data),
};

// FILE UPLOAD API
export const fileUploadAPI = {
  uploadAttachment: (taskId: number, file: File): Promise<ApiResponse<AttachmentDto>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<AttachmentDto>>(`/files/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  deleteAttachment: (attachmentId: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/files/attachments/${attachmentId}`).then(res => res.data),

  getUploadLimits: (): Promise<ApiResponse<UploadLimitsDto>> =>
    apiClient.get<ApiResponse<UploadLimitsDto>>("/files/upload-limits").then(res => res.data),
};

// TASKS API
export const tasksAPI = {
  getTasks: (filter?: TodoTaskFilterDto): Promise<ApiResponse<TodoTaskDto[]>> =>
    apiClient.get<ApiResponse<TodoTaskDto[]>>("/todotasks", { params: filter }).then(res => res.data),

  getTaskById: (id: number): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.get<ApiResponse<TodoTaskDto>>(`/todotasks/${id}`).then(res => res.data),

  createTask: (taskData: CreateTodoTaskDto): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.post<ApiResponse<TodoTaskDto>>("/todotasks", taskData).then(res => res.data),

  updateTask: (
    id: number,
    taskData: UpdateTodoTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.put<ApiResponse<TodoTaskDto>>(`/todotasks/${id}`, taskData).then(res => res.data),

  deleteTask: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/todotasks/${id}`).then(res => res.data),

  updateTaskProgress: (
    id: number,
    progress: number
  ): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/todotasks/${id}/progress/${progress}`,
      {}
    ).then(res => res.data),

  completeTask: (
    id: number,
    isCompleted: boolean
  ): Promise<ApiResponse<TodoTaskDto>> =>
    apiClient.patch<ApiResponse<TodoTaskDto>>(
      `/todotasks/${id}/complete/${isCompleted}`,
      {}
    ).then(res => res.data),

  bulkDeleteTasks: (data: BulkDeleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/todotasks/bulk-delete", data).then(res => res.data),

  bulkCompleteTasks: (data: BulkCompleteTaskDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/todotasks/bulk-complete", data).then(res => res.data),

  getAttachmentsForTask: (taskId: number): Promise<ApiResponse<AttachmentDto[]>> =>
    apiClient.get<ApiResponse<AttachmentDto[]>>(`/files/tasks/${taskId}/attachments`).then(res => res.data),
};

// CATEGORIES API
export const categoriesAPI = {
  getCategories: (filter?: CategoryFilterDto): Promise<ApiResponse<CategoryDto[]>> =>
    apiClient.get<ApiResponse<CategoryDto[]>>("/categories", { params: filter }).then(res => res.data),

  getCategoryById: (id: number): Promise<ApiResponse<CategoryDto>> =>
    apiClient.get<ApiResponse<CategoryDto>>(`/categories/${id}`).then(res => res.data),

  createCategory: (categoryData: CreateCategoryDto): Promise<ApiResponse<CategoryDto>> =>
    apiClient.post<ApiResponse<CategoryDto>>("/categories", categoryData).then(res => res.data),

  updateCategory: (
    id: number,
    categoryData: UpdateCategoryDto
  ): Promise<ApiResponse<CategoryDto>> =>
    apiClient.put<ApiResponse<CategoryDto>>(`/categories/${id}`, categoryData).then(res => res.data),

  deleteCategory: (id: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/categories/${id}`).then(res => res.data),
};

// SEARCH API
export const searchAPI = {
  getSuggestions: (query: string): Promise<ApiResponse<SearchSuggestionsResponse>> =>
    apiClient.get<ApiResponse<SearchSuggestionsResponse>>("/search/suggestions", { params: { query } }).then(res => res.data),
};

// 2FA API Methods
export const twoFactorAPI = {
  // 2FA durumunu getir
  getStatus: async (): Promise<ApiResponse<TwoFactorStatus>> => {
    const response = await apiClient.get('/twofactorauth/status');
    return response.data;
  },

  // 2FA etkinleştir
  enable: async (data: Enable2FARequest): Promise<ApiResponse<Enable2FAResponse>> => {
    const response = await apiClient.post('/twofactorauth/enable', data);
    return response.data;
  },

  // 2FA doğrula
  verify: async (data: Verify2FARequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/twofactorauth/verify', data);
    return response.data;
  },

  // 2FA devre dışı bırak
  disable: async (data: Disable2FARequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/twofactorauth/disable', data);
    return response.data;
  },

  // Kurtarma kodları oluştur
  generateRecoveryCodes: async (): Promise<ApiResponse<RecoveryCodesResponse>> => {
    const response = await apiClient.post('/twofactorauth/recovery-codes');
    return response.data;
  },

  // Kurtarma kodu kullan
  useRecoveryCode: async (data: Verify2FARequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/twofactorauth/recovery', data);
    return response.data;
  }
};

// Captcha API Methods
export const captchaAPI = {
  // Captcha konfigürasyonunu getir
  getConfig: async (): Promise<ApiResponse<CaptchaConfig>> => {
    const response = await apiClient.get('/captcha/config');
    return response.data;
  },

  // Captcha doğrula
  verify: async (data: CaptchaVerification): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/captcha/verify', data);
    return response.data;
  }
};

// WebAuthn API Methods
export const webAuthnAPI = {
  // WebAuthn durumunu getir
  getStatus: async (): Promise<ApiResponse<WebAuthnStatus>> => {
    const response = await apiClient.get('/webauthn/status');
    return response.data;
  },

  // WebAuthn kayıt başlat
  startRegistration: async (data: WebAuthnRegistrationRequest): Promise<ApiResponse<WebAuthnRegistrationResponse>> => {
    const response = await apiClient.post('/webauthn/register/start', data);
    return response.data;
  },

  // WebAuthn kayıt tamamla
  completeRegistration: async (data: WebAuthnRegistrationComplete): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/webauthn/register/complete', data);
    return response.data;
  },

  // WebAuthn giriş başlat
  startAuthentication: async (data: WebAuthnAuthenticationRequest): Promise<ApiResponse<WebAuthnAuthenticationResponse>> => {
    const response = await apiClient.post('/webauthn/authenticate/start', data);
    return response.data;
  },

  // WebAuthn giriş tamamla
  completeAuthentication: async (data: WebAuthnAuthenticationComplete): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/webauthn/authenticate/complete', data);
    return response.data;
  },

  // WebAuthn credential sil
  deleteCredential: async (credentialId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/webauthn/credentials/${credentialId}`);
    return response.data;
  }
};

// Export apiClient for direct use
export { apiClient };

// Export types for external use
export type {
  UserStatsDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
  TodoTaskFilterDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  AttachmentDto,
  UploadLimitsDto,
};
