/**
 * Password Strength Indicator Component - Refactored
 *
 * Şifre gücünü görsel olarak gösteren component.
 * Modüler utilities kullanır.
 *
 * @version 2.0.0 - Modular
 */

import React, { useState, useEffect } from 'react';
import { analyzePasswordStrength } from '../../utils/password/passwordStrengthUtils';
import type { 
  PasswordStrength,
  PasswordAnalysisResult,
  PasswordStrengthConfig 
} from '../../utils/password/passwordStrengthTypes';
import { 
  PASSWORD_STRENGTH_COLORS, 
  PASSWORD_STRENGTH_LABELS 
} from '../../utils/password/passwordStrengthTypes';

/**
 * Password Strength Indicator Props Interface
 */
interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
  config?: Partial<PasswordStrengthConfig>;
  onStrengthChange?: (strength: PasswordStrength, score: number) => void;
}

/**
 * Password Strength Indicator Component - Refactored
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showSuggestions = true,
  className = '',
  config,
  onStrengthChange
}) => {
  const [analysis, setAnalysis] = useState<PasswordAnalysisResult>({
    strength: 'VeryWeak',
    score: 0,
    suggestions: [],
    errors: [],
    details: {
      hasLowercase: false,
      hasUppercase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      hasMinLength: false,
      isCommon: false,
      hasSequential: false,
      hasRepeated: false,
    },
  });

  // Analyze password on change
  useEffect(() => {
    const result = analyzePasswordStrength(password, config as PasswordStrengthConfig);
    setAnalysis(result);
    
    if (onStrengthChange) {
      onStrengthChange(result.strength, result.score);
    }
  }, [password, config, onStrengthChange]);

  const colors = PASSWORD_STRENGTH_COLORS[analysis.strength];
  const label = PASSWORD_STRENGTH_LABELS[analysis.strength];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Şifre Gücü</span>
          <span className={`font-medium ${colors.text}`}>
            {label} ({analysis.score}/100)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colors.bg}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center gap-2 ${
          analysis.details.hasMinLength ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span>{analysis.details.hasMinLength ? '✓' : '○'}</span>
          <span>8+ karakter</span>
        </div>
        
        <div className={`flex items-center gap-2 ${
          analysis.details.hasUppercase ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span>{analysis.details.hasUppercase ? '✓' : '○'}</span>
          <span>Büyük harf</span>
        </div>
        
        <div className={`flex items-center gap-2 ${
          analysis.details.hasLowercase ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span>{analysis.details.hasLowercase ? '✓' : '○'}</span>
          <span>Küçük harf</span>
        </div>
        
        <div className={`flex items-center gap-2 ${
          analysis.details.hasNumbers ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span>{analysis.details.hasNumbers ? '✓' : '○'}</span>
          <span>Rakam</span>
        </div>
        
        <div className={`flex items-center gap-2 ${
          analysis.details.hasSpecialChars ? 'text-green-600' : 'text-gray-500'
        }`}>
          <span>{analysis.details.hasSpecialChars ? '✓' : '○'}</span>
          <span>Özel karakter</span>
        </div>
        
        <div className={`flex items-center gap-2 ${
          !analysis.details.isCommon ? 'text-green-600' : 'text-red-500'
        }`}>
          <span>{!analysis.details.isCommon ? '✓' : '✗'}</span>
          <span>Yaygın değil</span>
        </div>
      </div>

      {/* Errors */}
      {analysis.errors.length > 0 && (
        <div className="space-y-1">
          {analysis.errors.map((error, index) => (
            <div key={index} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && analysis.suggestions.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Öneriler:
          </div>
          {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span>💡</span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;

// Re-export types for convenience
export type { PasswordStrength } from '../../utils/password/passwordStrengthTypes'; 