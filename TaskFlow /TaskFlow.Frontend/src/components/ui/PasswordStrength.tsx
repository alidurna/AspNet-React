/**
 * Password Strength Indicator Component
 *
 * Bu dosya, TaskFlow uygulamasında şifre gücünü görsel olarak gösteren
 * component'i içerir. Kullanıcıların güvenli şifre oluşturmasına yardımcı olur.
 *
 * Ana Özellikler:
 * - Gerçek zamanlı şifre gücü analizi
 * - Görsel progress bar
 * - Renk kodlu güç seviyeleri
 * - Detaylı güvenlik önerileri
 * - Animasyonlu geçişler
 * - Accessibility desteği
 *
 * Güç Seviyeleri:
 * - VeryWeak (0-20): Kırmızı
 * - Weak (21-40): Turuncu
 * - Medium (41-60): Sarı
 * - Strong (61-80): Açık yeşil
 * - VeryStrong (81-100): Koyu yeşil
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';

/**
 * Password Strength Level Type
 */
export type PasswordStrength = 'VeryWeak' | 'Weak' | 'Medium' | 'Strong' | 'VeryStrong';

/**
 * Password Strength Indicator Props Interface
 */
interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
  onStrengthChange?: (strength: PasswordStrength, score: number) => void;
}

/**
 * Password Strength Indicator Component
 *
 * Şifre gücünü analiz eder ve görsel olarak gösterir.
 * Gerçek zamanlı feedback sağlar ve güvenlik önerileri sunar.
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showSuggestions = true,
  className = '',
  onStrengthChange
}) => {
  const [strength, setStrength] = useState<PasswordStrength>('VeryWeak');
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Şifre gücünü analiz et
  useEffect(() => {
    if (!password) {
      setStrength('VeryWeak');
      setScore(0);
      setSuggestions([]);
      setErrors([]);
      return;
    }

    let score = 0;
    const suggestions: string[] = [];
    const errors: string[] = [];

    // Minimum uzunluk kontrolü
    const minLength = 6;
    if (password.length < minLength) {
      errors.push(`Şifre en az ${minLength} karakter olmalıdır`);
      suggestions.push('Daha uzun bir şifre kullanın');
    } else {
      score += 10;
      if (password.length >= 8) score += 10;
      if (password.length >= 12) score += 10;
      if (password.length >= 16) score += 5;
    }

    // Büyük harf kontrolü
    const hasUppercase = /[A-Z]/.test(password);
    if (!hasUppercase) {
      suggestions.push('En az bir büyük harf ekleyin');
    } else {
      score += 15;
    }

    // Küçük harf kontrolü
    const hasLowercase = /[a-z]/.test(password);
    if (!hasLowercase) {
      suggestions.push('En az bir küçük harf ekleyin');
    } else {
      score += 10;
    }

    // Sayı kontrolü
    const hasDigit = /\d/.test(password);
    if (!hasDigit) {
      suggestions.push('En az bir sayı ekleyin');
    } else {
      score += 15;
    }

    // Özel karakter kontrolü
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasSpecialChar) {
      suggestions.push('En az bir özel karakter ekleyin (!@#$%^&* vb.)');
    } else {
      score += 20;
    }

    // Yaygın şifre kontrolü
    const commonPasswords = [
      '123456', 'password', '123456789', '12345678', '12345', '1234567', '1234567890',
      'qwerty', 'abc123', 'million2', '000000', '1234', 'iloveyou', 'aaron431',
      'password1', 'qqww1122', '123', 'omgpop', '123321', '654321', 'admin', 'root',
      'turkey', 'türkiye', 'istanbul', 'ankara', 'test', 'guest', 'welcome'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Bu şifre çok yaygın kullanılıyor, daha güvenli bir şifre seçin');
      score -= 20;
    }

    // Tekrarlanan karakter kontrolü
    const hasRepeatingChars = /(.)\1{2,}/.test(password);
    if (hasRepeatingChars) {
      suggestions.push('Tekrarlanan karakterlerden kaçının');
      score -= 10;
    }

    // Ardışık karakter kontrolü
    const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)/i.test(password);
    if (hasSequentialChars) {
      suggestions.push('Ardışık karakterlerden kaçının (123, abc gibi)');
      score -= 10;
    }

    // Score'u 0-100 arasında tut
    score = Math.max(0, Math.min(100, score));

    // Strength seviyesi belirle
    let strength: PasswordStrength;
    if (score < 30) strength = 'VeryWeak';
    else if (score < 50) strength = 'Weak';
    else if (score < 70) strength = 'Medium';
    else if (score < 90) strength = 'Strong';
    else strength = 'VeryStrong';

    setStrength(strength);
    setScore(score);
    setSuggestions(suggestions);
    setErrors(errors);

    // Callback'i çağır
    if (onStrengthChange) {
      onStrengthChange(strength, score);
    }
  }, [password, onStrengthChange]);

  // Güç seviyesine göre renk ve metin döndürür
  const getStrengthInfo = (strength: PasswordStrength): {
    color: string;
    bgColor: string;
    textColor: string;
    text: string;
    icon: React.ReactNode;
  } => {
    switch (strength) {
      case 'VeryWeak':
        return {
          color: 'bg-red-300',
          bgColor: 'bg-red-25',
          textColor: 'text-red-500',
          text: 'Çok Zayıf',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Weak':
        return {
          color: 'bg-orange-300',
          bgColor: 'bg-orange-25',
          textColor: 'text-orange-500',
          text: 'Zayıf',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Medium':
        return {
          color: 'bg-yellow-300',
          bgColor: 'bg-yellow-25',
          textColor: 'text-yellow-500',
          text: 'Orta',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Strong':
        return {
          color: 'bg-emerald-300',
          bgColor: 'bg-emerald-25',
          textColor: 'text-emerald-500',
          text: 'Güçlü',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'VeryStrong':
        return {
          color: 'bg-green-300',
          bgColor: 'bg-green-25',
          textColor: 'text-green-500',
          text: 'Çok Güçlü',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          color: 'bg-gray-300',
          bgColor: 'bg-gray-25',
          textColor: 'text-gray-500',
          text: 'Bilinmiyor',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const strengthInfo = getStrengthInfo(strength);

  // Şifre boşsa component'i gösterme
  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Şifre Gücü</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{strengthInfo.text}</span>
            <span className="text-lg">{strengthInfo.icon}</span>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${strengthInfo.color}`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Şifre gücü: ${score}%`}
          />
        </div>
        
        {/* Score Text */}
        <div className="flex justify-between text-xs text-gray-300">
          <span>0%</span>
          <span>{score}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-red-400">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Güvenlik Önerileri:</p>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strength Summary */}
      <div className={`p-3 rounded-lg ${strengthInfo.bgColor}`}>
        <div className="flex items-center space-x-2">
          <div className={`${strengthInfo.textColor}`}>
            {strengthInfo.icon}
          </div>
          <div>
            <p className={`text-sm ${strengthInfo.textColor}`}>
              {strengthInfo.text} Şifre
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {score < 50 
                ? 'Şifrenizi güçlendirmek için yukarıdaki önerileri uygulayın'
                : score < 80
                ? 'Şifreniz iyi, daha da güçlendirebilirsiniz'
                : 'Mükemmel! Şifreniz çok güvenli'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator; 