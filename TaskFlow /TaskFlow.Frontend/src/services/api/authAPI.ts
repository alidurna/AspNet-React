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
} from "../../types/auth/auth.types";

export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/v1/Auth/login", credentials).then(res => res.data),

  register: (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/v1/Auth/register", userData).then(res => res.data),

  logout: (): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/Auth/logout").then(res => res.data),

  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/v1/Auth/refresh", { refreshToken }).then(res => res.data),

  sendEmailVerification: (data: EmailVerificationRequest): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/users/email-verification-request", data).then(res => res.data),

  verifyEmail: (data: EmailVerification): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/users/email-verification", data).then(res => res.data),

  requestPasswordReset: (data: PasswordResetRequestDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/users/password-reset-request", data).then(res => res.data),

  resetPassword: (data: PasswordResetDto): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/users/password-reset", data).then(res => res.data),

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>("/v1/users/change-password", data).then(res => res.data),

  login2FA: (data: Login2FARequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/v1/Auth/login-2fa", data).then(res => res.data),

  loginWithRecovery: (data: LoginRecoveryRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>("/v1/Auth/login-recovery", data).then(res => res.data),

  captchaAPI: {
    getConfig: (): Promise<ApiResponse<CaptchaConfig>> =>
      apiClient.get<ApiResponse<CaptchaConfig>>('/v1/Captcha/config').then(res => res.data),

    verify: (data: CaptchaVerification): Promise<ApiResponse<object>> =>
      apiClient.post<ApiResponse<object>>('/v1/Captcha/verify', data).then(res => res.data),
  },
};

export const twoFactorAPI = {
  getStatus: (): Promise<ApiResponse<TwoFactorStatus>> =>
    apiClient.get<ApiResponse<TwoFactorStatus>>('/v1/TwoFactorAuth/status').then(res => res.data),

  enable: (data: Enable2FARequest): Promise<ApiResponse<Enable2FAResponse>> =>
    apiClient.post<ApiResponse<Enable2FAResponse>>('/v1/TwoFactorAuth/enable', data).then(res => res.data),

  verify: (data: Verify2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/v1/TwoFactorAuth/verify', data).then(res => res.data),

  disable: (data: Disable2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/v1/TwoFactorAuth/disable', data).then(res => res.data),

  generateRecoveryCodes: (): Promise<ApiResponse<RecoveryCodesResponse>> =>
    apiClient.post<ApiResponse<RecoveryCodesResponse>>('/v1/TwoFactorAuth/recovery-codes').then(res => res.data),

  useRecoveryCode: (data: Verify2FARequest): Promise<ApiResponse<any>> =>
    apiClient.post<ApiResponse<any>>('/v1/TwoFactorAuth/recovery', data).then(res => res.data),
};

export const webAuthnAPI = {
  getStatus: (): Promise<ApiResponse<WebAuthnStatus>> =>
    apiClient.get<ApiResponse<WebAuthnStatus>>('/v1/WebAuthn/status').then(res => res.data),

  beginRegistration: (): Promise<ApiResponse<WebAuthnRegistrationResponse>> =>
    apiClient.get<ApiResponse<WebAuthnRegistrationResponse>>('/v1/WebAuthn/register/begin').then(res => res.data),

  completeRegistration: (data: WebAuthnRegistrationComplete): Promise<ApiResponse<object>> =>
    apiClient.post<ApiResponse<object>>('/v1/WebAuthn/register/complete', data).then(res => res.data),

  beginAuthentication: (): Promise<ApiResponse<WebAuthnAuthenticationResponse>> =>
    apiClient.get<ApiResponse<WebAuthnAuthenticationResponse>>('/v1/WebAuthn/authenticate/begin').then(res => res.data),

  completeAuthentication: (data: WebAuthnAuthenticationComplete): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/WebAuthn/authenticate/complete', data).then(res => res.data),
}; 