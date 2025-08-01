/**
 * Social Login Component - Refactored
 * 
 * Sosyal medya ile giriş seçeneklerini yöneten component.
 * Modüler provider components kullanır.
 * 
 * @version 2.0.0 - Modular
 */

import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useAnalytics } from '../../hooks/useAnalytics';

// Provider Components
import { GoogleLoginProvider } from './providers/GoogleLoginProvider';
import { AppleLoginProvider } from './providers/AppleLoginProvider';
import { FacebookLoginProvider } from './providers/FacebookLoginProvider';

interface SocialLoginProps {
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Social Login Component - Refactored
 */
const SocialLogin: React.FC<SocialLoginProps> = ({
  onSuccess,
  disabled = false,
  className = '',
}) => {
  const { socialLogin } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const { trackEvent } = useAnalytics();

  /**
   * Handle successful OAuth login
   */
  const handleOAuthSuccess = async (provider: string, userData: any) => {
    try {
      await socialLogin(provider, userData);
      showSuccess(`${provider} ile giriş başarılı!`);
      trackEvent('social_login_success', { provider });
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sosyal giriş başarısız';
      showError(errorMessage);
      trackEvent('social_login_error', { provider, error: errorMessage });
    }
  };

  /**
   * Handle OAuth error
   */
  const handleOAuthError = (provider: string, error: string) => {
    showError(`${provider} girişi başarısız: ${error}`);
    trackEvent('social_login_error', { provider, error });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            veya
          </span>
        </div>
      </div>

      {/* Social Login Providers */}
      <div className="space-y-3">
        <GoogleLoginProvider
          onSuccess={(userData) => handleOAuthSuccess('Google', userData)}
          onError={(error) => handleOAuthError('Google', error)}
          disabled={disabled}
        />

        <AppleLoginProvider
          onSuccess={(userData) => handleOAuthSuccess('Apple', userData)}
          onError={(error) => handleOAuthError('Apple', error)}
          disabled={disabled}
        />

        <FacebookLoginProvider
          onSuccess={(userData) => handleOAuthSuccess('Facebook', userData)}
          onError={(error) => handleOAuthError('Facebook', error)}
          disabled={disabled}
        />
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        Sosyal medya ile giriş yaparak{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
          Gizlilik Politikamızı
        </a>{' '}
        ve{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
          Kullanım Şartlarımızı
        </a>{' '}
        kabul etmiş olursunuz.
      </div>
    </div>
  );
};

export default SocialLogin; 