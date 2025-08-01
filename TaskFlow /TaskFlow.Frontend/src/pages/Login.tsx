/**
 * Login Page - Refactored
 * 
 * Modüler component'ler kullanılarak refactor edilmiş login sayfası.
 * Ana form LoginForm component'ine taşındı.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/layout/AuthLayout';

// Refactored Components
import LoginForm, { type LoginFormData } from '../components/auth/LoginForm';
import SocialLogin from '../components/auth/SocialLogin';

/**
 * Login Page Component
 */
const Login: React.FC = () => {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const { login, isLoading: authIsLoading } = useAuth();
  const toast = useToast();

  // ===== STATE =====
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');

  // ===== EVENT HANDLERS =====
  /**
   * Form submission handler
   */
  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      
      console.log('🚀 Login attempt:', data.email);

      // Authentication context üzerinden login işlemi
      await login({ email: data.email, password: data.password }, rememberMe);

      console.log('✅ Login successful, redirecting to dashboard...');
      
      // Başarılı login sonrası dashboard'a yönlendir
      navigate('/dashboard');
      
      toast.showSuccess('Başarıyla giriş yaptınız!');
    } catch (error: any) {
      // Hata mesajını kullanıcıya göster
      const errorMessage = error.response?.data?.message || error.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      toast.showError(errorMessage);
    }
  };

  /**
   * Social login handler
   */
  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login initiated`);
    toast.showInfo(`${provider} ile giriş özelliği yakında eklenecek!`);
  };

  // ===== RENDER =====
  return (
    <AuthLayout
      title="Giriş Yap"
      description="TaskFlow hesabınıza giriş yapın"
    >
      <div className="space-y-6">
        {/* Main Login Form */}
        <LoginForm
          onSubmit={handleFormSubmit}
          isLoading={authIsLoading}
          error={error}
          rememberMe={rememberMe}
          onRememberMeChange={setRememberMe}
        />

        {/* Alternative Login Methods */}
        <div className="space-y-4">
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

          {/* Social Login */}
          <SocialLogin 
            onSuccess={(provider, userData) => {
              console.log(`${provider} login success:`, userData);
              toast.showSuccess(`${provider} ile başarıyla giriş yaptınız!`);
              navigate('/dashboard');
            }}
            onError={(provider, error) => {
              console.error(`${provider} login error:`, error);
              toast.showError(`${provider} girişi başarısız: ${error}`);
            }}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login; 