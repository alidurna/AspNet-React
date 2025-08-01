/**
 * Authentication Types - TaskFlow Frontend
 *
 * Authentication (kimlik doğrulama) işlemleri için type tanımları.
 */

import type { User } from './user.types';

/**
 * Login Request Interface
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Request Interface
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Authentication Response Interface
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string; // "Bearer"
}

/**
 * Change Password Request Interface
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Password Reset Request Interface
 */
export interface PasswordResetRequestDto {
  email: string;
}

/**
 * Password Reset Interface
 */
export interface PasswordResetDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Email Verification Request Interface
 */
export interface EmailVerificationRequest {
  email: string;
}

/**
 * Email Verification Interface
 */
export interface EmailVerification {
  email: string;
  token: string;
}

/**
 * OAuth Provider Types
 */
export type OAuthProvider = 'google' | 'facebook' | 'github' | 'microsoft';

/**
 * OAuth Login Request Interface
 */
export interface OAuthLoginRequest {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
  state?: string;
}

/**
 * OAuth Response Interface
 */
export interface OAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  provider: OAuthProvider;
}

/**
 * Refresh Token Request Interface
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication Context Type
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: PasswordResetDto) => Promise<void>;
  verifyEmail: (data: EmailVerification) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
}

/**
 * Authentication Error Types
 */
export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

/**
 * Login Validation Errors
 */
export interface LoginErrors {
  email?: string[];
  password?: string[];
  general?: string[];
}

/**
 * Register Validation Errors
 */
export interface RegisterErrors {
  firstName?: string[];
  lastName?: string[];
  email?: string[];
  phoneNumber?: string[];
  password?: string[];
  confirmPassword?: string[];
  acceptTerms?: string[];
  general?: string[];
} 