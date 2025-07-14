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
import config from "../config/environment"; // config objesini varsayılan olarak import et
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  EmailVerificationRequest,
  EmailVerification,
} from "../types/auth.types";

import type { AttachmentDto } from "../types/file.types";
import type { BulkDeleteTaskDto, BulkCompleteTaskDto } from "../types/task.types"; // Eklendi
import type { SearchSuggestionsResponse } from "../types/search.types"; // Eklendi

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
  setToken: (token: string): void => {
    localStorage.setItem("taskflow_token", token);
  },
  getToken: (): string | null => {
    return localStorage.getItem("taskflow_token");
  },
  removeToken: (): void => {
    localStorage.removeItem("taskflow_token");
  },
  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem("taskflow_refresh_token", refreshToken);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem("taskflow_refresh_token");
  },
  removeRefreshToken: (): void => {
    localStorage.removeItem("taskflow_refresh_token");
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
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error("❌ Refresh token hatası:", refreshError);
          processQueue(refreshError, null);
          tokenManager.removeToken();
          tokenManager.removeRefreshToken();
          if (onUnauthorizedCallback) onUnauthorizedCallback(); // Callback'i çağır
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Refresh token yoksa doğrudan login sayfasına yönlendir
        tokenManager.removeToken();
        tokenManager.removeRefreshToken();
        if (onUnauthorizedCallback) onUnauthorizedCallback(); // Callback'i çağır
        return Promise.reject(error);
      }
    }

    // Genel hata işleme
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
        // Başarılı girişte apiClient'in varsayılan Authorization header'ını ayarla
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
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
   * @returns void
   */
  logout: async (): Promise<void> => {
    try {
      // Backend'deki UsersController'daki revoke-refresh-token endpoint'ini çağır
      await apiClient.post("/users/revoke-refresh-token");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      tokenManager.removeToken();
      // Frontend tarafında direkt login sayfasına yönlendirme logic'i artık AuthContext tarafından yönetiliyor
      // window.location.href = "/login"; // Bu satırı kaldırdık
    }
  },
  /**
   * Kullanıcı Profili Al (authAPI içindeki getProfile kaldırılıyor, profileAPI kullanacağız)
   * @returns User
   */
  // getProfile: async (): Promise<User> => {
  //   try {
  //     const response = await apiClient.get<{ success: boolean; data: User }>(
  //       "/users/profile"
  //     );
  //     return response.data.data;
  //   } catch (error) {
  //     const message =
  //       error instanceof Error ? error.message : "Profil bilgileri alınamadı";
  //     throw new Error(message);
  //   }
  // },

  /**
   * E-posta doğrulama isteği gönderir.
   * Kullanıcının kayıtlı e-posta adresine bir doğrulama kodu gönderir.
   * @param emailData EmailVerificationRequest (yalnızca email içerir)
   * @returns ApiResponse<object>
   */
  requestEmailVerification: async (emailData: EmailVerificationRequest): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/email-verification-request",
        emailData
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "E-posta doğrulama isteği başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * E-posta adresini doğrulama kodu ile onaylar.
   * Kullanıcının e-posta adresini ve aldığı doğrulama kodunu doğrulama için gönderir.
   * @param verificationData EmailVerification (email ve token içerir)
   * @returns ApiResponse<object>
   */
  verifyEmail: async (verificationData: EmailVerification): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/email-verification",
        verificationData
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "E-posta doğrulama başarısız oldu";
      throw new Error(message);
    }
  },
};

/**
 * Profile API Service
 *
 * Kullanıcı profili bilgilerini yönetmek için fonksiyonlar.
 */
export const profileAPI = {
  /**
   * Kullanıcı profilini getirir.
   * @returns UserProfile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>("/users/profile");
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil bilgileri alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcı profilini günceller.
   * @param data UpdateProfileRequest
   * @returns UserProfile
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>(
        "/v1.0/users/profile",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil güncellenemedi";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcının şifresini değiştirir.
   * @param data ChangePasswordRequest
   * @returns boolean Başarılı ise true
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.put<ApiResponse<boolean>>(
        "/v1.0/users/change-password",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Şifre değiştirilemedi";
      throw new Error(message);
    }
  },
  requestEmailVerification: (data: EmailVerificationRequest): Promise<ApiResponse<void>> =>
    apiClient.post<ApiResponse<void>>("/v1.0/users/request-email-verification", data).then(response => response.data),
  verifyEmail: (data: EmailVerification): Promise<ApiResponse<void>> =>
    apiClient.post<ApiResponse<void>>("/v1.0/users/verify-email", data).then(response => response.data),
  getUserStatistics: (): Promise<ApiResponse<UserStatsDto>> =>
    apiClient.get<ApiResponse<UserStatsDto>>("/users/statistics").then(response => response.data),
};

/**
 * File Upload API Service
 *
 * Dosya yükleme (avatar, attachment) ve yönetimi için fonksiyonlar.
 */
export const fileUploadAPI = {
  /**
   * Kullanıcının avatarını yükler.
   * @param file File
   * @returns ApiResponse<any>
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<ApiResponse<any>>(
        "/files/avatar",
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
        error instanceof Error ? error.message : "Avatar yükleme başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * Görev eki yükler.
   * @param request AttachmentUploadRequestDto
   * @returns ApiResponse<any>
   */
  uploadAttachment: async (
    request: AttachmentUploadRequestDto
  ): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append("file", request.file);
      formData.append("taskId", request.taskId.toString());
      const response = await apiClient.post<ApiResponse<any>>(
        "/files/attachment",
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
        error instanceof Error ? error.message : "Ek yükleme başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcının profil avatarını siler.
   * @returns ApiResponse<object>
   */
  deleteAvatar: async (): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>("/files/avatar");
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Avatar silme başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * Yükleme limitleri bilgilerini getirir.
   * @returns ApiResponse<UploadLimitsDto>
   */
  getUploadLimits: async (): Promise<ApiResponse<UploadLimitsDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<UploadLimitsDto>>("/files/limits");
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Yükleme limitleri alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir göreve ait ekli dosyaların listesini getirir.
   * @param taskId number
   * @returns ApiResponse<AttachmentDto[]>
   */
  getAttachmentsForTask: async (taskId: number): Promise<ApiResponse<AttachmentDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<AttachmentDto[]>>(`/files/attachments/task/${taskId}`);
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ekli dosyalar getirilemedi";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir göreve ait ekli dosyaları siler.
   * @param taskId number
   * @returns ApiResponse<object>
   */
  deleteTaskAttachments: async (taskId: number): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(`/files/attachment/task/${taskId}`);
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ekli dosyalar silinemedi";
      throw new Error(message);
    }
  },
};

/**
 * Categories API Service
 *
 * Kategori oluşturma, listeleme, güncelleme ve silme işlemleri için fonksiyonlar.
 */
export const categoriesAPI = {
  /**
   * Tüm kategorileri getirir.
   * @param filters CategoryFilterDto
   * @returns CategoryDto[]
   */
  getCategories: async (
    filters?: CategoryFilterDto
  ): Promise<ApiResponse<CategoryDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<CategoryDto[]>>(
        "/categories",
        { params: filters }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kategoriler alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Yeni kategori oluşturur.
   * @param category CreateCategoryDto
   * @returns CategoryDto
   */
  createCategory: async (
    category: CreateCategoryDto
  ): Promise<ApiResponse<CategoryDto>> => {
    try {
      const response = await apiClient.post<ApiResponse<CategoryDto>>(
        "/categories",
        category
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kategori oluşturulamadı";
      throw new Error(message);
    }
  },

  /**
   * Kategoriyi ID'ye göre günceller.
   * @param id number
   * @param category UpdateCategoryDto
   * @returns CategoryDto
   */
  updateCategory: async (
    id: number,
    category: UpdateCategoryDto
  ): Promise<ApiResponse<CategoryDto>> => {
    try {
      const response = await apiClient.put<ApiResponse<CategoryDto>>(
        `/categories/${id}`,
        category
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kategori güncellenemedi";
      throw new Error(message);
    }
  },

  /**
   * Kategoriyi ID'ye göre siler.
   * @param id number
   * @returns object
   */
  deleteCategory: async (id: number): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kategori silinemedi";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcıya ait kategori istatistiklerini getirir.
   * @returns CategorySummaryDto[]
   */
  getCategorySummary: async (): Promise<ApiResponse<CategorySummaryDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<CategorySummaryDto[]>>(
        "/categories/summary"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kategori özeti alınamadı";
      throw new Error(message);
    }
  },
};

/**
 * Tasks API Service
 *
 * Görev oluşturma, listeleme, güncelleme ve silme işlemleri için fonksiyonlar.
 */
export const tasksAPI = {
  /**
   * Tüm görevleri getirir.
   * @param filters TodoTaskFilterDto
   * @returns TodoTaskDto[]
   */
  getTasks: async (
    filters?: TodoTaskFilterDto
  ): Promise<ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>>(
        "/todotasks",
        { params: filters }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görevler alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir görevi ID'ye göre getirir.
   * @param id number
   * @returns TodoTaskDto
   */
  getTaskById: async (id: number): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev bulunamadı";
      throw new Error(message);
    }
  },

  /**
   * Yeni görev oluşturur.
   * @param task CreateTodoTaskDto
   * @returns TodoTaskDto
   */
  createTask: async (
    task: CreateTodoTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.post<ApiResponse<TodoTaskDto>>(
        "/todotasks",
        task
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev oluşturulamadı";
      throw new Error(message);
    }
  },

  /**
   * Görevi ID'ye göre günceller.
   * @param id number
   * @param task UpdateTodoTaskDto
   * @returns TodoTaskDto
   */
  updateTask: async (
    id: number,
    task: UpdateTodoTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.put<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}`,
        task
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev güncellenemedi";
      throw new Error(message);
    }
  },

  /**
   * Görevi ID'ye göre siler.
   * @param id number
   * @returns object
   */
  deleteTask: async (id: number): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        `/todotasks/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev silinemedi";
      throw new Error(message);
    }
  },

  /**
   * Görev tamamlama durumunu günceller.
   * @param id number
   * @param isCompleted boolean
   * @returns object
   */
  completeTask: async (
    id: number,
    isCompleted: boolean
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.patch<ApiResponse<object>>(
        `/todotasks/${id}/complete`,
        { isCompleted }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev tamamlama durumu güncellenemedi";
      throw new Error(message);
    }
  },

  /**
   * Görev ilerlemesini günceller.
   * @param id number
   * @param progress number
   * @returns object
   */
  updateTaskProgress: async (
    id: number,
    progress: number
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.patch<ApiResponse<object>>(
        `/todotasks/${id}/progress`,
        { progress }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev ilerlemesi güncellenemedi";
      throw new Error(message);
    }
  },

  /**
   * Görev istatistiklerini getirir.
   * @returns TaskStatsDto
   */
  getTaskStats: async (): Promise<ApiResponse<TaskStatsDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<TaskStatsDto>>(
        "/todotasks/statistics"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev istatistikleri alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Önceliğe göre görev istatistiklerini getirir.
   * @returns TaskPriorityStatsDto[]
   */
  getTaskPriorityStats: async (): Promise<
    ApiResponse<TaskPriorityStatsDto[]>
  > => {
    try {
      const response = await apiClient.get<
        ApiResponse<TaskPriorityStatsDto[]>
      >("/todotasks/priority-statistics");
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev öncelik istatistikleri alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Birden fazla görevü siler.
   * @param tasks BulkDeleteTaskDto[]
   * @returns ApiResponse<object>
   */
  bulkDeleteTasks: async (data: BulkDeleteTaskDto): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>("/todotasks/bulk-delete", data);
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görevler silinemedi";
      throw new Error(message);
    }
  },

  /**
   * Birden fazla görevin tamamlama durumunu günceller.
   * @param tasks BulkCompleteTaskDto[]
   * @returns ApiResponse<object>
   */
  bulkCompleteTasks: async (data: BulkCompleteTaskDto): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>("/todotasks/bulk-complete", data);
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görevler tamamlanmadı";
      throw new Error(message);
    }
  },
};

/**
 * Search API Service
 *
 * Global ve gelişmiş arama işlemleri için fonksiyonlar.
 */
export const searchAPI = {
  /**
   * Görevler üzerinde gelişmiş arama yapar.
   * @param request TaskSearchRequest
   * @returns TaskSearchResult[]
   */
  searchTasks: async (
    request: TaskSearchRequest
  ): Promise<ApiResponse<TaskSearchResult[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TaskSearchResult[]>>(
        "/search/tasks",
        { params: request }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev arama başarısız";
      throw new Error(message);
    }
  },

  /**
   * Arama önerilerini getirir (autocomplete için).
   * @param query string
   * @returns ApiResponse<SearchSuggestionsResponse>
   */
  getSearchSuggestions: async (query: string): Promise<ApiResponse<SearchSuggestionsResponse>> => {
    try {
      const response = await apiClient.get<ApiResponse<SearchSuggestionsResponse>>(
        `/search/suggestions?query=${query}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Arama önerileri alınamadı";
      throw new Error(message);
    }
  },

  /**
   * Global arama yapar.
   * @param request GlobalSearchRequest
   * @returns ApiResponse<GlobalSearchResponse>
   */
  globalSearch: async (request: GlobalSearchRequest): Promise<ApiResponse<GlobalSearchResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<GlobalSearchResponse>>(
        "/search/global",
        request
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Global arama başarısız";
      throw new Error(message);
    }
  },
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// Profile Types (UserProfile ve UpdateProfileRequest daha önce tanımlanmış)
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string; // Eklendi: Kullanıcının telefon numarası
  profileImage?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean; // Eklendi
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
  phoneNumber?: string; // Eklendi: Kullanıcının telefon numarası
}

export interface UserStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number; // Backend DTO'sundan eklendi
  taskCompletionRate: number; // Backend DTO'sundan eklendi (completionRate olarak güncellendi)
  averageCompletionDays: number; // Backend DTO'sundan eklendi
  tasksCompletedThisMonth: number; // Backend DTO'sundan eklendi
  tasksCompletedThisWeek: number; // Backend DTO'sundan eklendi
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequestDto {
  email: string;
}

export interface EmailVerificationDto {
  email: string;
  token: string;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
}

export interface TokenRefreshResponseDto {
  token: string;
  refreshToken: string;
  user: User;
}

export interface GlobalSearchRequest {
  query: string;
  includeUsers?: boolean;
}

export interface TaskSearchResult {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "InProgress" | "Completed" | "Cancelled";
  isCompleted: boolean;
  categoryId?: number;
  categoryName?: string;
  matchType: "Task";
}

export interface CategorySearchResult {
  id: number;
  name: string;
  description?: string;
  matchType: "Category";
}

export interface UserSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  matchType: "User";
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  tasks: TaskSearchResult[];
  categories: CategorySearchResult[];
  users: UserSearchResult[];
  searchTime: string; // DateTime olarak alınacak, string olarak kullanılabilir
}

export interface TaskSearchRequest {
  query?: string;
  priority?: "Low" | "Medium" | "High";
  isCompleted?: boolean;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface AttachmentUploadRequestDto {
  taskId: number;
  file: File;
}

export interface UploadLimitsDto {
  avatar: {
    maxSizeBytes: number;
    maxSizeFormatted: string;
    allowedTypes: string[];
  };
  attachment: {
    maxSizeBytes: number;
    maxSizeFormatted: string;
    allowedTypes: string[];
  };
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  colorCode?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  colorCode?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  colorCode?: string;
}

export interface CategoryFilterDto {
  name?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface CategorySummaryDto {
  categoryName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface TodoTaskDto {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601 formatında tarih
  priority: "Low" | "Medium" | "High";
  status: "Todo" | "InProgress" | "Completed" | "Cancelled";
  isCompleted: boolean;
  progress: number; // 0-100 arası
  categoryId?: number;
  categoryName?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  parentTaskId?: number;
  subTasks?: TodoTaskDto[]; // Alt görevler
  creatorUserName?: string; // Oluşturan kullanıcının adı
  assignedUserName?: string; // Atanan kullanıcının adı
}

export interface CreateTodoTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  categoryId?: number;
  parentTaskId?: number;
}

export interface UpdateTodoTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Todo" | "InProgress" | "Completed" | "Cancelled";
  categoryId?: number;
  parentTaskId?: number;
}

export interface TodoTaskFilterDto {
  searchQuery?: string;
  categoryId?: number;
  priority?: "Low" | "Medium" | "High";
  status?: "Todo" | "InProgress" | "Completed" | "Cancelled";
  dueDateStart?: string; // ISO 8601
  dueDateEnd?: string; // ISO 8601
  isCompleted?: boolean;
  includeSubTasks?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CompleteTaskDto {
  isCompleted: boolean;
}

export interface UpdateTaskProgressDto {
  progress: number;
}

export interface TaskStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
}

export interface TaskPriorityStatsDto {
  priority: "Low" | "Medium" | "High";
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}
