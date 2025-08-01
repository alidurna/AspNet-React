/**
 * Password Strength Utilities
 * 
 * Şifre gücü analizi için utility functions.
 */

import type { 
  PasswordStrength, 
  PasswordAnalysisResult, 
  PasswordStrengthConfig 
} from './passwordStrengthTypes';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PasswordStrengthConfig = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  checkCommonPasswords: true,
  checkSequentialChars: true,
  checkRepeatedChars: true,
};

/**
 * Common passwords list (simplified)
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  '12345678', '111111', '1234567890', 'admin', 'letmein', 'welcome',
  'monkey', 'dragon', 'master', 'football', 'baseball', 'superman'
];

/**
 * Check if password contains lowercase letters
 */
export const hasLowercase = (password: string): boolean => {
  return /[a-z]/.test(password);
};

/**
 * Check if password contains uppercase letters
 */
export const hasUppercase = (password: string): boolean => {
  return /[A-Z]/.test(password);
};

/**
 * Check if password contains numbers
 */
export const hasNumbers = (password: string): boolean => {
  return /\d/.test(password);
};

/**
 * Check if password contains special characters
 */
export const hasSpecialChars = (password: string): boolean => {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
};

/**
 * Check if password meets minimum length requirement
 */
export const hasMinLength = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength;
};

/**
 * Check if password is in common passwords list
 */
export const isCommonPassword = (password: string): boolean => {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
};

/**
 * Check if password has sequential characters
 */
export const hasSequentialChars = (password: string): boolean => {
  const sequences = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde'];
  return sequences.some(seq => password.toLowerCase().includes(seq));
};

/**
 * Check if password has repeated characters
 */
export const hasRepeatedChars = (password: string): boolean => {
  return /(.)\1{2,}/.test(password);
};

/**
 * Calculate password strength score
 */
export const calculatePasswordScore = (
  password: string, 
  config: PasswordStrengthConfig = DEFAULT_CONFIG
): number => {
  if (!password) return 0;

  let score = 0;

  // Length scoring
  if (password.length >= config.minLength) {
    score += 25;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // Character variety scoring
  if (hasLowercase(password)) score += 10;
  if (hasUppercase(password)) score += 10;
  if (hasNumbers(password)) score += 10;
  if (hasSpecialChars(password)) score += 15;

  // Bonus for character variety
  const varietyCount = [
    hasLowercase(password),
    hasUppercase(password),
    hasNumbers(password),
    hasSpecialChars(password)
  ].filter(Boolean).length;

  if (varietyCount >= 3) score += 10;
  if (varietyCount === 4) score += 10;

  // Penalties
  if (isCommonPassword(password)) score -= 30;
  if (hasSequentialChars(password)) score -= 15;
  if (hasRepeatedChars(password)) score -= 15;

  return Math.max(0, Math.min(100, score));
};

/**
 * Determine password strength based on score
 */
export const getPasswordStrength = (score: number): PasswordStrength => {
  if (score >= 81) return 'VeryStrong';
  if (score >= 61) return 'Strong';
  if (score >= 41) return 'Medium';
  if (score >= 21) return 'Weak';
  return 'VeryWeak';
};

/**
 * Generate password suggestions
 */
export const generatePasswordSuggestions = (
  password: string,
  config: PasswordStrengthConfig = DEFAULT_CONFIG
): string[] => {
  const suggestions: string[] = [];

  if (!password) {
    suggestions.push('Şifre girin');
    return suggestions;
  }

  if (password.length < config.minLength) {
    suggestions.push(`En az ${config.minLength} karakter kullanın`);
  }

  if (config.requireLowercase && !hasLowercase(password)) {
    suggestions.push('Küçük harf ekleyin (a-z)');
  }

  if (config.requireUppercase && !hasUppercase(password)) {
    suggestions.push('Büyük harf ekleyin (A-Z)');
  }

  if (config.requireNumbers && !hasNumbers(password)) {
    suggestions.push('Rakam ekleyin (0-9)');
  }

  if (config.requireSpecialChars && !hasSpecialChars(password)) {
    suggestions.push('Özel karakter ekleyin (!@#$%^&*)');
  }

  if (isCommonPassword(password)) {
    suggestions.push('Yaygın şifreler kullanmayın');
  }

  if (hasSequentialChars(password)) {
    suggestions.push('Ardışık karakterler kullanmayın (123, abc)');
  }

  if (hasRepeatedChars(password)) {
    suggestions.push('Tekrar eden karakterler kullanmayın (aaa, 111)');
  }

  if (suggestions.length === 0) {
    suggestions.push('Şifreniz güçlü görünüyor!');
  }

  return suggestions;
};

/**
 * Generate password errors
 */
export const generatePasswordErrors = (
  password: string,
  config: PasswordStrengthConfig = DEFAULT_CONFIG
): string[] => {
  const errors: string[] = [];

  if (!password) return errors;

  if (password.length < config.minLength) {
    errors.push(`Şifre en az ${config.minLength} karakter olmalıdır`);
  }

  if (isCommonPassword(password)) {
    errors.push('Bu şifre çok yaygın ve güvenli değil');
  }

  return errors;
};

/**
 * Analyze password strength - Main function
 */
export const analyzePasswordStrength = (
  password: string,
  config: PasswordStrengthConfig = DEFAULT_CONFIG
): PasswordAnalysisResult => {
  const score = calculatePasswordScore(password, config);
  const strength = getPasswordStrength(score);
  const suggestions = generatePasswordSuggestions(password, config);
  const errors = generatePasswordErrors(password, config);

  return {
    strength,
    score,
    suggestions,
    errors,
    details: {
      hasLowercase: hasLowercase(password),
      hasUppercase: hasUppercase(password),
      hasNumbers: hasNumbers(password),
      hasSpecialChars: hasSpecialChars(password),
      hasMinLength: hasMinLength(password, config.minLength),
      isCommon: isCommonPassword(password),
      hasSequential: hasSequentialChars(password),
      hasRepeated: hasRepeatedChars(password),
    },
  };
}; 