/**
 * Password Strength Types
 * 
 * Şifre gücü ile ilgili type definitions.
 */

/**
 * Password Strength Level Type
 */
export type PasswordStrength = 'VeryWeak' | 'Weak' | 'Medium' | 'Strong' | 'VeryStrong';

/**
 * Password Analysis Result Interface
 */
export interface PasswordAnalysisResult {
  strength: PasswordStrength;
  score: number;
  suggestions: string[];
  errors: string[];
  details: {
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    hasMinLength: boolean;
    isCommon: boolean;
    hasSequential: boolean;
    hasRepeated: boolean;
  };
}

/**
 * Password Strength Config Interface
 */
export interface PasswordStrengthConfig {
  minLength: number;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  checkCommonPasswords: boolean;
  checkSequentialChars: boolean;
  checkRepeatedChars: boolean;
}

/**
 * Password Strength Colors
 */
export const PASSWORD_STRENGTH_COLORS = {
  VeryWeak: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-300',
  },
  Weak: {
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    border: 'border-orange-300',
  },
  Medium: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    border: 'border-yellow-300',
  },
  Strong: {
    bg: 'bg-green-400',
    text: 'text-green-600',
    border: 'border-green-300',
  },
  VeryStrong: {
    bg: 'bg-green-600',
    text: 'text-green-700',
    border: 'border-green-400',
  },
} as const;

/**
 * Password Strength Labels
 */
export const PASSWORD_STRENGTH_LABELS = {
  VeryWeak: 'Çok Zayıf',
  Weak: 'Zayıf',
  Medium: 'Orta',
  Strong: 'Güçlü',
  VeryStrong: 'Çok Güçlü',
} as const; 