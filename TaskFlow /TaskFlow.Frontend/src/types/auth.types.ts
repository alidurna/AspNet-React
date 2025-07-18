import type { ApiResponse } from "../services/api"; // ApiResponse eklendi

/**
 * Authentication Types - TaskFlow Frontend
 *
 * Bu dosya, authentication (kimlik doğrulama) işlemleri için kullanılan
 * tüm TypeScript type tanımlarını içerir.
 *
 * İçerik:
 * - User model interface'i
 * - Login/Register request interface'leri
 * - API response interface'leri
 * - Authentication context type'ları
 * - Error handling type'ları
 *
 * Backend API ile uyumlu type tanımları:
 * - UserDto.cs ile User interface uyumlu
 * - Login/Register endpoint'leri ile request type'ları uyumlu
 * - ApiResponseModel.cs ile response type'ları uyumlu
 */

/**
 * Kullanıcı Model Interface
 *
 * Backend'deki User entity'si ve UserDto ile uyumlu.
 * Kullanıcı bilgilerini temsil eder.
 *
 * Alanlar:
 * - id: Benzersiz kullanıcı kimliği (GUID)
 * - firstName: Kullanıcının adı
 * - lastName: Kullanıcının soyadı
 * - email: Email adresi (unique)
 * - phoneNumber: Telefon numarası (opsiyonel)
 * - createdAt: Hesap oluşturulma tarihi
 * - updatedAt: Son güncelleme tarihi
 */
export interface User {
  id: string; // GUID format: "12345678-1234-1234-1234-123456789012"
  firstName: string; // Örnek: "Ali"
  lastName: string; // Örnek: "Durna"
  email: string; // Örnek: "ali@example.com"
  phoneNumber?: string; // Örnek: "+90 555 123 45 67" (opsiyonel)
  profileImage?: string; // Eklendi
  createdAt: string; // ISO date string: "2024-01-01T12:00:00Z"
  updatedAt: string; // ISO date string: "2024-01-01T12:00:00Z"
  isEmailVerified: boolean; // Eklendi
}

/**
 * Login Request Interface
 *
 * Kullanıcı giriş işlemi için backend'e gönderilecek veri yapısı.
 * Backend'deki login endpoint'i ile uyumlu.
 *
 * Zorunlu Alanlar:
 * - email: Kullanıcının email adresi
 * - password: Kullanıcının şifresi
 *
 * Opsiyonel Alanlar:
 * - rememberMe: Kullanıcıyı hatırla seçeneği (token süresini uzatır)
 */
export interface LoginRequest {
  email: string; // Örnek: "ali@example.com"
  password: string; // Örnek: "MySecurePassword123"
  rememberMe?: boolean; // Default: false
}

/**
 * Register Request Interface
 *
 * Yeni kullanıcı kayıt işlemi için backend'e gönderilecek veri yapısı.
 * Backend'deki register endpoint'i ile uyumlu.
 *
 * Zorunlu Alanlar:
 * - firstName: Kullanıcının adı
 * - lastName: Kullanıcının soyadı
 * - email: Email adresi (unique olmalı)
 * - password: Güçlü şifre
 * - confirmPassword: Şifre doğrulama (frontend validation için)
 *
 * Opsiyonel Alanlar:
 * - phoneNumber: Telefon numarası
 */
export interface RegisterRequest {
  firstName: string; // Örnek: "Ali"
  lastName: string; // Örnek: "Durna"
  email: string; // Örnek: "ali@example.com"
  phoneNumber?: string; // Örnek: "+90 555 123 45 67"
  password: string; // Örnek: "MySecurePassword123"
  confirmPassword: string; // Şifre ile aynı olmalı (frontend validation)
}

/**
 * Authentication Response Interface
 *
 * Backend'den gelen authentication işlemi sonucu.
 * Login/Register işlemleri sonrasında dönen veri yapısı.
 * Backend'deki ApiResponseModel ile uyumlu.
 *
 * Başarılı Response:
 * - success: true
 * - message: Başarı mesajı
 * - user: Kullanıcı bilgileri
 * - token: JWT access token
 * - refreshToken: Refresh token (opsiyonel)
 *
 * Hatalı Response:
 * - success: false
 * - message: Hata mesajı
 * - errors: Detaylı hata listesi
 */
export interface AuthResponse {
  user: User; // Kullanıcı bilgileri
  token: string; // JWT access token
  refreshToken?: string; // Refresh token (opsiyonel)
}

/**
 * Authentication Context Type
 *
 * React Context API ile global state yönetimi için kullanılacak type.
 * Tüm uygulama boyunca authentication durumunu yönetir.
 *
 * State:
 * - user: Mevcut kullanıcı bilgileri (null ise giriş yapılmamış)
 * - isLoading: Authentication durumu kontrol ediliyor mu?
 * - isAuthenticated: Kullanıcı giriş yapmış mı?
 *
 * Actions:
 * - login: Kullanıcı giriş işlemi
 * - register: Kullanıcı kayıt işlemi
 * - logout: Kullanıcı çıkış işlemi
 * - updateUser: Kullanıcı bilgilerini güncelleme
 */
export interface AuthContextType {
  // ===== STATE =====
  user: User | null; // Mevcut kullanıcı (null = giriş yapılmamış)
  isLoading: boolean; // Loading durumu
  isAuthenticated: boolean; // Giriş durumu (computed property)

  // ===== ACTIONS =====
  login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>; // Giriş işlemi
  register: (userData: RegisterRequest) => Promise<void>; // Kayıt işlemi
  logout: () => void; // Çıkış işlemi
  updateUser: (userData: Partial<User>) => Promise<void>; // Kullanıcı güncelleme
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

/**
 * AuthApiMethods: API servisindeki kimlik doğrulama ile ilgili metotların tipini tanımlar.
 * Bu, `authAPI` nesnesinin TypeScript tarafından doğru anlaşılmasını sağlar.
 */
export interface AuthApiMethods {
  login: (credentials: LoginRequest) => Promise<ApiResponse<AuthResponse>>; // Return type updated
  register: (userData: RegisterRequest) => Promise<ApiResponse<AuthResponse>>; // Return type updated
  logout: () => Promise<ApiResponse<object>>;
  requestEmailVerification: (emailData: EmailVerificationRequest) => Promise<ApiResponse<EmailVerification>>;
  verifyEmail: (verificationData: EmailVerification) => Promise<ApiResponse<EmailVerification>>;
  requestPasswordReset: (data: PasswordResetRequestDto) => Promise<ApiResponse<object>>;
  resetPassword: (data: PasswordResetDto) => Promise<ApiResponse<object>>;
}

/**
 * API Error Interface
 *
 * Backend'den gelen hata yanıtları için standardize edilmiş format.
 * Error handling ve kullanıcıya hata mesajları göstermek için kullanılır.
 *
 * HTTP Status Codes:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (authentication required)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found
 * - 500: Internal Server Error
 */
export interface ApiError {
  status: number; // HTTP status code
  message: string; // Ana hata mesajı
  errors?: { [key: string]: string[] }; // Field-specific validation errors
  timestamp: string; // Hata zamanı (ISO string)
  path: string; // API endpoint path
}

/**
 * JWT Token Payload Interface
 *
 * JWT token'ın decode edilmiş içeriği.
 * Token validation ve user bilgisi çıkarma için kullanılır.
 *
 * Standard JWT Claims:
 * - sub: Subject (user ID)
 * - email: User email
 * - iat: Issued at (token oluşturulma zamanı)
 * - exp: Expiration time (token sona erme zamanı)
 *
 * Custom Claims:
 * - firstName: Kullanıcı adı
 * - lastName: Kullanıcı soyadı
 * - role: Kullanıcı rolü (future feature)
 */
export interface JwtPayload {
  sub: string; // User ID (GUID)
  email: string; // User email
  firstName: string; // User first name
  lastName: string; // User last name
  role?: string; // User role (admin, user, etc.) - future feature
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerification {
  email: string;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
  };
}

export interface UserProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  stats: UserStatsDto;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  profileImage?: string;
  phoneNumber?: string;
}

export interface UserStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  taskCompletionRate: number;
  averageCompletionDays: number;
  tasksCompletedThisMonth: number;
  tasksCompletedThisWeek: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Sosyal medya girişi için tip tanımları
 */
export interface SocialLoginRequest {
  provider: "google" | "apple" | "microsoft";
  token: string;
  userData: SocialUserData;
}

export interface SocialUserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  provider: string;
}

export interface OAuthResponse {
  type: "OAUTH_SUCCESS" | "OAUTH_ERROR";
  token?: string;
  userData?: SocialUserData;
  error?: string;
}

// 2FA (İki Faktörlü Kimlik Doğrulama) Tipleri
export interface TwoFactorStatus {
  isEnabled: boolean;
  isConfigured: boolean;
  lastUsed?: string;
  recoveryCodesRemaining: number;
}

export interface Enable2FARequest {
  password: string;
}

export interface Enable2FAResponse {
  secretKey: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  isEnabled: boolean;
}

export interface Verify2FARequest {
  code: string;
  rememberDevice?: boolean;
}

export interface Disable2FARequest {
  password: string;
  code: string;
}

export interface RecoveryCodesResponse {
  codes: string[];
  isGenerated: boolean;
}

// Captcha Tipleri
export interface CaptchaVerification {
  token: string;
  action?: string;
  remoteIp?: string;
}

export interface CaptchaConfig {
  siteKey: string;
  secretKey: string;
  threshold: number;
  enabled: boolean;
}

// WebAuthn Tipleri
export interface WebAuthnStatus {
  isSupported: boolean;
  isEnabled: boolean;
  credentials: WebAuthnCredential[];
}

export interface WebAuthnCredential {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  type: string;
  transports: string;
}

export interface WebAuthnRegistrationRequest {
  username: string;
  displayName?: string;
}

export interface WebAuthnAuthenticationRequest {
  username: string;
}

export interface WebAuthnRegistrationResponse {
  challenge: string;
  publicKeyCredentialCreationOptions: any;
  sessionId: string;
}

export interface WebAuthnRegistrationComplete {
  sessionId: string;
  attestationResponse: any;
}

export interface WebAuthnAuthenticationResponse {
  challenge: string;
  publicKeyCredentialRequestOptions: any;
  sessionId: string;
}

export interface WebAuthnAuthenticationComplete {
  sessionId: string;
  assertionResponse: any;
}

// 2FA Login Types
export interface Login2FARequest {
  email: string;
  password: string;
  totpCode: string;
}

export interface LoginRecoveryRequest {
  email: string;
  password: string;
  recoveryCode: string;
}
