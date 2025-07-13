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
      // Frontend tarafında direkt login sayfasına yönlendir, backend responsundan bağımsız
      window.location.href = "/login";
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
};

// API Response Type
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

export interface UserStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: {
    priority: string;
    count: number;
  }[];
  tasksByCategory: {
    category: string;
    count: number;
  }[];
}

// Change Password Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Password Reset Types
export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Email Verification Types
export interface EmailVerificationRequestDto {
  email: string;
}

export interface EmailVerificationDto {
  email: string;
  token: string;
}

// Token Refresh Types
export interface TokenRefreshRequestDto {
  refreshToken: string;
}

export interface TokenRefreshResponseDto {
  token: string;
  refreshToken: string;
  user: User;
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

  /**
   * Kullanıcı Profilini Güncelle
   * @param data UpdateProfileRequest
   * @returns UserProfile
   */
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
        error instanceof Error
          ? error.message
          : "Profil güncellenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcı İstatistiklerini Al
   * @returns UserStatsDto
   */
  getUserStatistics: async (): Promise<ApiResponse<UserStatsDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserStatsDto>>(
        "/users/statistics"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kullanıcı istatistikleri alınamadı";
      throw new Error(message);
    }
  },
};

// New API objects for other functionalities
export const userAuthAPI = {
  /**
   * Şifre Değiştir
   * @param data ChangePasswordRequest
   * @returns boolean (başarı durumu)
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.put<ApiResponse<boolean>>(
        "/users/change-password",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Şifre değiştirme başarısız";
      throw new Error(message);
    }
  },

  /**
   * Şifre Sıfırlama İsteği Gönder
   * @param data PasswordResetRequestDto
   * @returns object
   */
  requestPasswordReset: async (
    data: PasswordResetRequestDto
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/password-reset-request",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Şifre sıfırlama isteği gönderilirken hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Şifreyi Sıfırla
   * @param data PasswordResetDto
   * @returns object
   */
  resetPassword: async (
    data: PasswordResetDto
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/password-reset",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Şifre sıfırlanırken hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * E-posta Doğrulama İsteği Gönder
   * @param data EmailVerificationRequestDto
   * @returns object
   */
  requestEmailVerification: async (
    data: EmailVerificationRequestDto
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/email-verification-request",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "E-posta doğrulama isteği gönderilirken hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * E-postayı Doğrula
   * @param data EmailVerificationDto
   * @returns object
   */
  verifyEmail: async (
    data: EmailVerificationDto
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/email-verification",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "E-posta doğrulanırken hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Refresh Token ile Yeni JWT Al
   * @param data TokenRefreshRequestDto
   * @returns TokenRefreshResponseDto
   */
  refreshToken: async (
    data: TokenRefreshRequestDto
  ): Promise<ApiResponse<TokenRefreshResponseDto>> => {
    try {
      const response = await apiClient.post<
        ApiResponse<TokenRefreshResponseDto>
      >("/users/refresh-token", data);
      // Yeni token ve refresh token'ı kaydet
      if (response.data.success && response.data.data?.token) {
        tokenManager.setToken(response.data.data.token);
        // Refresh token'ı da yönetmemiz gerekebilir, ancak mevcut kodda sadece JWT token saklanıyor.
        // Eğer backend refresh token'ı da döndürüyorsa, burada saklanmalı.
      }
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Token yenilenirken hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Tüm Oturumları Kapat (Refresh Token'ları İptal Et)
   * @returns object
   */
  logoutAllSessions: async (): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        "/users/logout-all-sessions"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tüm oturumlar kapatılırken hata oluştu";
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
  /**
   * Kullanıcının görevlerini filtreleme ve sayfalama ile getirir
   * @param filter Filtreleme ve sayfalama parametreleri
   * @returns Görev listesi ve sayfalama metadata
   */
  getTasks: async (
    filter?: TodoTaskFilterDto
  ): Promise<
    ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>
  > => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ tasks: TodoTaskDto[]; pagination: PaginationMetadata }>
      >("/todotasks", { params: filter });
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görevler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir görevi ID'sine göre getirir
   * @param id Görev ID'si
   * @returns Görev detayları
   */
  getTaskById: async (id: number): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Yeni görev oluşturur
   * @param data Görev oluşturma bilgileri
   * @returns Oluşturulan görev
   */
  createTask: async (
    data: CreateTodoTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.post<ApiResponse<TodoTaskDto>>(
        "/todotasks",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev oluşturulurken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görevi günceller
   * @param id Görev ID'si
   * @param data Güncelleme bilgileri
   * @returns Güncellenen görev
   */
  updateTask: async (
    id: number,
    data: UpdateTodoTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.put<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev güncellenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görevi siler
   * @param id Görev ID'si
   * @returns Başarılı silme yanıtı
   */
  deleteTask: async (id: number): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        `/todotasks/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev silinirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görevin tamamlanma durumunu günceller
   * @param id Görev ID'si
   * @param data Tamamlanma durumu bilgisi
   * @returns Güncellenen görev
   */
  completeTask: async (
    id: number,
    data: CompleteTaskDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.patch<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}/complete`,
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev tamamlanırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görevin ilerleme durumunu günceller
   * @param id Görev ID'si
   * @param data İlerleme durumu bilgisi (0-100)
   * @returns Güncellenen görev
   */
  updateTaskProgress: async (
    id: number,
    data: UpdateTaskProgressDto
  ): Promise<ApiResponse<TodoTaskDto>> => {
    try {
      const response = await apiClient.patch<ApiResponse<TodoTaskDto>>(
        `/todotasks/${id}/progress`,
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev ilerlemesi güncellenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görevleri metin tabanlı arar
   * @param searchText Aranacak metin
   * @param maxResults Maksimum sonuç sayısı
   * @returns Arama sonuçları listesi
   */
  searchTasks: async (
    searchText: string,
    maxResults?: number
  ): Promise<ApiResponse<TodoTaskDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto[]>>(
        "/todotasks/search",
        { params: { searchText, maxResults } }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görevler aranırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Vadesi geçmiş görevleri getirir
   * @returns Vadesi geçmiş görevler listesi
   */
  getOverdueTasks: async (): Promise<ApiResponse<TodoTaskDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto[]>>(
        "/todotasks/overdue"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Vadesi geçmiş görevler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Bugün vadesi dolan görevleri getirir
   * @returns Bugün vadesi dolan görevler listesi
   */
  getTasksDueToday: async (): Promise<ApiResponse<TodoTaskDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto[]>>(
        "/todotasks/today"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Bugün vadesi dolan görevler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Bu hafta vadesi dolan görevleri getirir
   * @returns Bu hafta vadesi dolan görevler listesi
   */
  getTasksDueThisWeek: async (): Promise<ApiResponse<TodoTaskDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto[]>>(
        "/todotasks/this-week"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Bu hafta vadesi dolan görevler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir ana görevin alt görevlerini getirir
   * @param parentId Ana görevin ID'si
   * @returns Alt görevler listesi
   */
  getSubTasks: async (
    parentId: number
  ): Promise<ApiResponse<TodoTaskDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<TodoTaskDto[]>>(
        `/todotasks/${parentId}/subtasks`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Alt görevler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Genel görev istatistiklerini getirir
   * @returns Görev istatistikleri
   */
  getTaskStatistics: async (): Promise<ApiResponse<TaskStatsDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<TaskStatsDto>>(
        "/todotasks/statistics"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev istatistikleri alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Önceliğe göre görev istatistiklerini getirir
   * @returns Önceliğe göre görev istatistikleri listesi
   */
  getTaskPriorityStatistics: async (): Promise<
    ApiResponse<TaskPriorityStatsDto[]>
  > => {
    try {
      const response = await apiClient.get<ApiResponse<TaskPriorityStatsDto[]>>(
        "/todotasks/statistics/priority"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Önceliğe göre görev istatistikleri alınırken bir hata oluştu";
      throw new Error(message);
    }
  },
};

/**
 * Categories API Service (Future Implementation)
 *
 * Kategori yönetimi işlemleri
 */
export const categoriesAPI = {
  /**
   * Kullanıcının kategorilerini getirir
   * @param filter Filtreleme parametreleri
   * @returns Kategoriler listesi
   */
  getCategories: async (
    filter?: CategoryFilterDto
  ): Promise<ApiResponse<CategoryDto[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<CategoryDto[]>>(
        "/categories",
        { params: filter }
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategoriler alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Belirli bir kategoriyi ID'sine göre getirir
   * @param id Kategori ID'si
   * @returns Kategori detayları
   */
  getCategoryById: async (id: number): Promise<ApiResponse<CategoryDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<CategoryDto>>(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategori alınırken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Yeni kategori oluşturur
   * @param data Kategori oluşturma bilgileri
   * @returns Oluşturulan kategori
   */
  createCategory: async (
    data: CreateCategoryDto
  ): Promise<ApiResponse<CategoryDto>> => {
    try {
      const response = await apiClient.post<ApiResponse<CategoryDto>>(
        "/categories",
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategori oluşturulurken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Kategoriyi günceller
   * @param id Kategori ID'si
   * @param data Güncelleme bilgileri
   * @returns Güncellenen kategori
   */
  updateCategory: async (
    id: number,
    data: UpdateCategoryDto
  ): Promise<ApiResponse<CategoryDto>> => {
    try {
      const response = await apiClient.put<ApiResponse<CategoryDto>>(
        `/categories/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategori güncellenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Kategoriyi siler
   * @param id Kategori ID'si
   * @returns Başarılı silme yanıtı
   */
  deleteCategory: async (id: number): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategori silinirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Kategori istatistiklerini getirir
   * @returns Kategori istatistikleri listesi
   */
  getCategoryStatistics: async (): Promise<
    ApiResponse<CategorySummaryDto[]>
  > => {
    try {
      const response = await apiClient.get<ApiResponse<CategorySummaryDto[]>>(
        "/categories/statistics"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kategori istatistikleri alınırken bir hata oluştu";
      throw new Error(message);
    }
  },
};

// TODO: Add other API service objects for Search

// Search Types
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

// Search API
export const searchAPI = {
  /**
   * Tüm varlıklarda (görevler, kategoriler, kullanıcılar) global arama yapar.
   * @param request Global arama parametreleri
   * @returns Birleşik arama sonuçları
   */
  globalSearch: async (
    request: GlobalSearchRequest
  ): Promise<ApiResponse<GlobalSearchResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<GlobalSearchResponse>>(
        "/search/global",
        request
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Global arama başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * Gelişmiş filtrelerle görev bazlı arama yapar.
   * @param request Görev arama parametreleri
   * @returns Filtrelenmiş görev sonuçları
   */
  searchTasks: async (
    request: TaskSearchRequest
  ): Promise<ApiResponse<TaskSearchResult[]>> => {
    try {
      const response = await apiClient.post<ApiResponse<TaskSearchResult[]>>(
        "/search/tasks",
        request
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Görev araması başarısız oldu";
      throw new Error(message);
    }
  },

  /**
   * Arama terimine göre öneriler getirir.
   * @param query Arama terimi
   * @returns Arama önerileri listesi
   */
  getSearchSuggestions: async (
    query: string
  ): Promise<ApiResponse<string[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>(
        `/search/suggestions?query=${query}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Arama önerileri alınırken bir hata oluştu";
      throw new Error(message);
    }
  },
};

// Default Export - Ana API Client
export default apiClient;

// New types for file uploads
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

// File Upload API
export const fileUploadAPI = {
  /**
   * Kullanıcı avatarını yükle
   * @param file Yüklenecek resim dosyası
   * @returns Başarılı yükleme yanıtı
   */
  uploadAvatar: async (
    file: File
  ): Promise<
    ApiResponse<{
      fileName: string;
      originalName: string;
      size: string;
      category: string;
      contentType: string;
    }>
  > => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<
        ApiResponse<{
          fileName: string;
          originalName: string;
          size: string;
          category: string;
          contentType: string;
        }>
      >("/files/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Avatar yüklenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Görev eki yükle
   * @param data Yüklenecek ek bilgileri ve dosya
   * @returns Başarılı yükleme yanıtı
   */
  uploadAttachment: async (
    data: AttachmentUploadRequestDto
  ): Promise<ApiResponse<object>> => {
    try {
      const formData = new FormData();
      formData.append("taskId", data.taskId.toString());
      formData.append("file", data.file);
      const response = await apiClient.post<ApiResponse<object>>(
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
        error instanceof Error
          ? error.message
          : "Ek dosya yüklenirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Kullanıcının avatarını sil
   * @returns Başarılı silme yanıtı
   */
  deleteAvatar: async (): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        "/files/avatar"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Avatar silinirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Bir göreve ait tüm ekleri sil
   * @param taskId Eki silinecek görevin ID'si
   * @returns Başarılı silme yanıtı
   */
  deleteTaskAttachments: async (
    taskId: number
  ): Promise<ApiResponse<object>> => {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        `/files/attachment/task/${taskId}`
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Görev ekleri silinirken bir hata oluştu";
      throw new Error(message);
    }
  },

  /**
   * Yükleme limitlerini ve izin verilen dosya türlerini al
   * @returns Yükleme limitleri bilgisi
   */
  getUploadLimits: async (): Promise<ApiResponse<UploadLimitsDto>> => {
    try {
      const response = await apiClient.get<ApiResponse<UploadLimitsDto>>(
        "/files/limits"
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Yükleme limitleri alınırken bir hata oluştu";
      throw new Error(message);
    }
  },
};

// Categories Types
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

// Task Types
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
