/**
 * Security Types - TaskFlow Frontend
 *
 * Güvenlik, oturum yönetimi ve 2FA ile ilgili type tanımları.
 */

/**
 * Two-Factor Authentication Status
 */
export interface TwoFactorStatus {
  isEnabled: boolean;
  qrCodeUrl?: string;
  secretKey?: string;
  backupCodes?: string[];
  lastUsed?: string;
}

/**
 * Enable 2FA Request
 */
export interface Enable2FARequest {
  password: string;
  totpCode?: string;
}

/**
 * Enable 2FA Response
 */
export interface Enable2FAResponse {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

/**
 * Verify 2FA Request
 */
export interface Verify2FARequest {
  code: string;
  rememberDevice?: boolean;
}

/**
 * Disable 2FA Request
 */
export interface Disable2FARequest {
  password: string;
  code: string;
}

/**
 * Recovery Codes Response
 */
export interface RecoveryCodesResponse {
  codes: string[];
  generatedAt: string;
}

/**
 * 2FA Login Request
 */
export interface Login2FARequest {
  email: string;
  password: string;
  totpCode: string;
  rememberMe?: boolean;
  rememberDevice?: boolean;
}

/**
 * Recovery Code Login Request
 */
export interface LoginRecoveryRequest {
  email: string;
  password: string;
  recoveryCode: string;
  rememberMe?: boolean;
}

/**
 * Captcha Configuration
 */
export interface CaptchaConfig {
  isEnabled: boolean;
  siteKey: string;
  provider: 'recaptcha' | 'hcaptcha' | 'turnstile';
  theme: 'light' | 'dark';
  size: 'normal' | 'compact';
}

/**
 * Captcha Verification
 */
export interface CaptchaVerification {
  token: string;
  action?: string;
}

/**
 * WebAuthn Status
 */
export interface WebAuthnStatus {
  isSupported: boolean;
  isEnabled: boolean;
  credentials: WebAuthnCredential[];
}

/**
 * WebAuthn Credential
 */
export interface WebAuthnCredential {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  authenticatorType: 'platform' | 'cross-platform';
}

/**
 * WebAuthn Registration Request
 */
export interface WebAuthnRegistrationRequest {
  name: string;
  authenticatorType?: 'platform' | 'cross-platform';
}

/**
 * WebAuthn Registration Response
 */
export interface WebAuthnRegistrationResponse {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  timeout: number;
  attestation: 'none' | 'indirect' | 'direct';
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
}

/**
 * WebAuthn Registration Complete
 */
export interface WebAuthnRegistrationComplete {
  name: string;
  credentialId: string;
  clientDataJSON: string;
  attestationObject: string;
}

/**
 * WebAuthn Authentication Request
 */
export interface WebAuthnAuthenticationRequest {
  email?: string;
}

/**
 * WebAuthn Authentication Response
 */
export interface WebAuthnAuthenticationResponse {
  challenge: string;
  allowCredentials: Array<{
    type: 'public-key';
    id: string;
  }>;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
}

/**
 * WebAuthn Authentication Complete
 */
export interface WebAuthnAuthenticationComplete {
  credentialId: string;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

/**
 * Session Information
 */
export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

/**
 * Security Settings
 */
export interface SecuritySettings {
  twoFactorAuth: {
    isEnabled: boolean;
    method: 'totp' | 'sms' | 'email';
    backupCodes: number;
  };
  webAuthn: {
    isEnabled: boolean;
    credentials: number;
  };
  sessions: {
    maxConcurrent: number;
    timeoutMinutes: number;
    rememberMeEnabled: boolean;
  };
  loginAlerts: {
    emailNotifications: boolean;
    newDeviceAlerts: boolean;
    suspiciousActivityAlerts: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDataExport: boolean;
    accountDeletionRequested?: string;
  };
}

/**
 * Security Event Types
 */
export type SecurityEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'webauthn_added'
  | 'webauthn_removed'
  | 'suspicious_activity'
  | 'account_locked'
  | 'account_unlocked';

/**
 * Security Event
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isResolved: boolean;
} 