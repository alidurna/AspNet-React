/**
 * Authentication API
 * 
 * Tüm authentication ve güvenlik ile ilgili API endpoints.
 */

import { apiClient, type ApiResponse } from './apiClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  EmailVerificationRequest,
  EmailVerification,
  PasswordResetRequestDto,
  PasswordResetDto,
  ChangePasswordRequest,
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
  WebAuthnStatus,
  WebAuthnRegistrationRequest,
  WebAuthnRegistrationResponse,
  WebAuthnRegistrationComplete,
  WebAuthnAuthenticationRequest,
  WebAuthnAuthenticationResponse,
  WebAuthnAuthenticationComplete,
} from "../../types/auth.types";

/**
 * Basic Authentication API
 */
export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", credentials).then(res => res.data),

  register: (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", userData).then(res => res.data),

  logout: (): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/logout").then(res => res.data),

  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }).then(res => res.data),

  // Email verification
  sendEmailVerification: (data: EmailVerificationRequest): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/send-email-verification", data).then(res => res.data),

  verifyEmail: (data: EmailVerification): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/verify-email", data).then(res => res.data),

  // Password reset
  requestPasswordReset: (data: PasswordResetRequestDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/request-password-reset", data).then(res => res.data),

  resetPassword: (data: PasswordResetDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/reset-password", data).then(res => res.data),

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/auth/change-password", data).then(res => res.data),

  // 2FA with recovery code login
  login2FA: (data: Login2FARequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login-2fa", data).then(res => res.data),

  loginWithRecovery: (data: LoginRecoveryRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login-recovery", data).then(res => res.data),
};

/**
 * Two-Factor Authentication API
 */
export const twoFactorAPI = {
  getStatus: (): Promise<ApiResponse<TwoFactorStatus>> =>
    apiClient.get<ApiResponse<TwoFactorStatus>>('/twofactorauth/status').then(res => res.data),

  enable: (data: Enable2FARequest): Promise<ApiResponse<Enable2FAResponse>> =>
    apiClient.post<ApiResponse<Enable2FAResponse>>('/twofactorauth/enable', data).then(res => res.data),

  verify: (data: Verify2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/twofactorauth/verify', data).then(res => res.data),

  disable: (data: Disable2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/twofactorauth/disable', data).then(res => res.data),

  generateRecoveryCodes: (): Promise<ApiResponse<RecoveryCodesResponse>> =>
    apiClient.post<ApiResponse<RecoveryCodesResponse>>('/twofactorauth/recovery-codes').then(res => res.data),

  useRecoveryCode: (data: Verify2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/twofactorauth/recovery', data).then(res => res.data),
};

/**
 * Captcha API
 */
export const captchaAPI = {
  getConfig: (): Promise<ApiResponse<CaptchaConfig>> =>
    apiClient.get<ApiResponse<CaptchaConfig>>('/captcha/config').then(res => res.data),

  verify: (data: CaptchaVerification): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/captcha/verify', data).then(res => res.data),
};

/**
 * WebAuthn API
 */
export const webAuthnAPI = {
  getStatus: (): Promise<ApiResponse<WebAuthnStatus>> =>
    apiClient.get<ApiResponse<WebAuthnStatus>>('/webauthn/status').then(res => res.data),

  startRegistration: (data: WebAuthnRegistrationRequest): Promise<ApiResponse<WebAuthnRegistrationResponse>> =>
    apiClient.post<ApiResponse<WebAuthnRegistrationResponse>>('/webauthn/register/start', data).then(res => res.data),

  completeRegistration: (data: WebAuthnRegistrationComplete): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/webauthn/register/complete', data).then(res => res.data),

  startAuthentication: (data: WebAuthnAuthenticationRequest): Promise<ApiResponse<WebAuthnAuthenticationResponse>> =>
    apiClient.post<ApiResponse<WebAuthnAuthenticationResponse>>('/webauthn/authenticate/start', data).then(res => res.data),

  completeAuthentication: (data: WebAuthnAuthenticationComplete): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/webauthn/authenticate/complete', data).then(res => res.data),

  deleteCredential: (credentialId: string): Promise<ApiResponse<any>> =>
    apiClient.delete<ApiResponse<any>>(`/webauthn/credentials/${credentialId}`).then(res => res.data),
}; 