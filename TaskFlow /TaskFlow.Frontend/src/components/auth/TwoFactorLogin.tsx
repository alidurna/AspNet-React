import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authAPI } from '../../services/api';
import type { Login2FARequest, LoginRecoveryRequest } from '../../types/auth.types';

/**
 * 2FA Login Form Validation Schema
 */
const twoFactorSchema = z.object({
  totpCode: z
    .string()
    .min(6, 'TOTP kodu 6 haneli olmalıdır')
    .max(6, 'TOTP kodu 6 haneli olmalıdır')
    .regex(/^\d{6}$/, 'TOTP kodu sadece rakam içermelidir'),
});

const recoverySchema = z.object({
  recoveryCode: z
    .string()
    .min(1, 'Recovery code gereklidir')
    .regex(/^[A-Z0-9]{8}$/, 'Recovery code 8 karakterli olmalıdır'),
});

interface TwoFactorLoginProps {
  email: string;
  password: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Two Factor Authentication Login Component
 * 
 * Bu component, kullanıcı normal login sonrası 2FA doğrulaması gerektiğinde gösterilir.
 * TOTP kodu veya recovery code ile giriş yapma seçenekleri sunar.
 */
export const TwoFactorLogin: React.FC<TwoFactorLoginProps> = ({
  email,
  password,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TOTP form
  const {
    register: registerTotp,
    handleSubmit: handleSubmitTotp,
    formState: { errors: totpErrors },
    reset: resetTotp,
  } = useForm<{ totpCode: string }>({
    resolver: zodResolver(twoFactorSchema),
  });

  // Recovery form
  const {
    register: registerRecovery,
    handleSubmit: handleSubmitRecovery,
    formState: { errors: recoveryErrors },
    reset: resetRecovery,
  } = useForm<{ recoveryCode: string }>({
    resolver: zodResolver(recoverySchema),
  });

  /**
   * TOTP kodu ile giriş
   */
  const handleTotpSubmit = async (data: { totpCode: string }) => {
    setIsLoading(true);
    try {
      const loginData: Login2FARequest = {
        email,
        password,
        totpCode: data.totpCode,
      };

      const response = await authAPI.loginWith2FA(loginData);
      
      if (response.success) {
        toast.showSuccess('2FA ile başarıyla giriş yapıldı!');
        onSuccess();
        navigate('/dashboard');
      } else {
        toast.showError(response.message || '2FA doğrulaması başarısız');
      }
    } catch (error: any) {
      console.error('2FA login error:', error);
      toast.showError(error.response?.data?.message || '2FA girişi sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Recovery code ile giriş
   */
  const handleRecoverySubmit = async (data: { recoveryCode: string }) => {
    setIsLoading(true);
    try {
      const loginData: LoginRecoveryRequest = {
        email,
        password,
        recoveryCode: data.recoveryCode,
      };

      const response = await authAPI.loginWithRecoveryCode(loginData);
      
      if (response.success) {
        toast.showSuccess('Recovery code ile başarıyla giriş yapıldı!');
        onSuccess();
        navigate('/dashboard');
      } else {
        toast.showError(response.message || 'Recovery code doğrulaması başarısız');
      }
    } catch (error: any) {
      console.error('Recovery login error:', error);
      toast.showError(error.response?.data?.message || 'Recovery code girişi sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mod değiştirme
   */
  const toggleMode = () => {
    setIsRecoveryMode(!isRecoveryMode);
    resetTotp();
    resetRecovery();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-soft p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            İki Faktörlü Kimlik Doğrulama
          </h2>
          <p className="text-gray-600 text-sm">
            {isRecoveryMode 
              ? 'Recovery code ile giriş yapın'
              : 'Authenticator uygulamanızdan kodu girin'
            }
          </p>
        </div>

        {/* TOTP Form */}
        {!isRecoveryMode && (
          <form onSubmit={handleSubmitTotp(handleTotpSubmit)} className="space-y-4">
            <Input
              id="totp-code"
              type="text"
              label="TOTP Kodu"
              placeholder="000000"
              maxLength={6}
              {...registerTotp('totpCode')}
              error={totpErrors.totpCode?.message}
              disabled={isLoading}
              autoComplete="one-time-code"
            />

            <Button
              type="submit"
              variant="default"
              isLoading={isLoading}
              className="w-full"
            >
              Giriş Yap
            </Button>
          </form>
        )}

        {/* Recovery Form */}
        {isRecoveryMode && (
          <form onSubmit={handleSubmitRecovery(handleRecoverySubmit)} className="space-y-4">
            <Input
              id="recovery-code"
              type="text"
              label="Recovery Code"
              placeholder="XXXXXXXX"
              maxLength={8}
              {...registerRecovery('recoveryCode')}
              error={recoveryErrors.recoveryCode?.message}
              disabled={isLoading}
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="default"
              isLoading={isLoading}
              className="w-full"
            >
              Recovery Code ile Giriş
            </Button>
          </form>
        )}

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isRecoveryMode 
              ? 'TOTP kodu ile giriş yap'
              : 'Recovery code kullan'
            }
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            Geri dön
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Yardım</p>
              <p className="text-blue-600">
                {isRecoveryMode 
                  ? 'Recovery code\'larınızı güvenli bir yerde saklayın. Her kullanımda bir kod silinir.'
                  : 'Google Authenticator, Authy veya benzeri bir uygulamadan 6 haneli kodu girin.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorLogin; 