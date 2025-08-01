/**
 * Authentication Types - Main Export
 * 
 * Modüler authentication types'ların ana export dosyası.
 * Eski auth.types.ts'in yerini alan refactored yapı.
 */

// Re-export all user types
export type {
  User,
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  UserStatsDto,
  UserSearchResult,
} from './user.types';

// Re-export all authentication types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  PasswordResetRequestDto,
  PasswordResetDto,
  EmailVerificationRequest,
  EmailVerification,
  OAuthProvider,
  OAuthLoginRequest,
  OAuthResponse,
  RefreshTokenRequest,
  AuthContextType,
  AuthError,
  LoginErrors,
  RegisterErrors,
} from './authentication.types';

// Re-export all security types
export type {
  TwoFactorStatus,
  Enable2FARequest,
  Enable2FAResponse,
  Verify2FARequest,
  Disable2FARequest,
  RecoveryCodesResponse,
  Login2FARequest,
  LoginRecoveryRequest,
  CaptchaConfig,
  CaptchaVerification,
  WebAuthnStatus,
  WebAuthnCredential,
  WebAuthnRegistrationRequest,
  WebAuthnRegistrationResponse,
  WebAuthnRegistrationComplete,
  WebAuthnAuthenticationRequest,
  WebAuthnAuthenticationResponse,
  WebAuthnAuthenticationComplete,
  SessionInfo,
  SecuritySettings,
  SecurityEventType,
  SecurityEvent,
} from './security.types';

// Legacy compatibility exports (avoid duplicates)
// Main types are already exported above via re-exports
