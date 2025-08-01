/**
 * LoginForm Component
 * 
 * Login sayfasının ana form component'i.
 * Email/şifre girişi, validasyon ve form submission'ı yönetir.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';

import { Button } from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Login Form Schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta gereklidir')
    .email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginForm Props
 */
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
  rememberMe?: boolean;
  onRememberMeChange?: (checked: boolean) => void;
}

/**
 * LoginForm Component
 */
const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  rememberMe = false,
  onRememberMeChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  /**
   * Form submit handler
   */
  const handleFormSubmit = (data: LoginFormData) => {
    onSubmit(data);
  };

  /**
   * Password visibility toggle
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          E-posta Adresi
        </label>
        <Input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          {...register('email')}
          error={errors.email?.message}
          disabled={isLoading || isSubmitting}
          autoComplete="email"
          className="w-full"
        />
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Şifre
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifrenizi girin"
            {...register('password')}
            error={errors.password?.message}
            disabled={isLoading || isSubmitting}
            autoComplete="current-password"
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading || isSubmitting}
            tabIndex={-1}
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" />
            ) : (
              <FaEye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange?.(e.target.checked)}
            disabled={isLoading || isSubmitting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Beni Hatırla
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Şifremi Unuttum
          </a>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || isSubmitting || !watchedEmail || !watchedPassword}
        className="w-full flex items-center justify-center gap-2 py-3"
        variant="default"
      >
        {isLoading || isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Giriş yapılıyor...</span>
          </>
        ) : (
          <>
            <FaSignInAlt className="w-4 h-4" />
            <span>Giriş Yap</span>
          </>
        )}
      </Button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hesabınız yok mu?{' '}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Kayıt Olun
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm; 