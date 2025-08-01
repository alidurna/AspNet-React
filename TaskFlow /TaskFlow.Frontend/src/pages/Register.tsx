/**
 * Register Sayfası
 * 
 * Refactored version - Ana form mantığı RegisterForm component'ine taşındı.
 * Bu sayfa sadece layout ve orchestration sorumluluğunu alır.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterRequest } from "../types/auth.types";
import AuthLayout from "../components/layout/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";
import { captchaAPI } from "../services/api";
import { useToast } from "../hooks/useToast";

/**
 * Register Sayfası Component
 * 
 * Yeni kullanıcıların sisteme kayıt olabilmesi için tasarlanmış sayfa.
 * RegisterForm component'ini kullanarak modüler yapı sağlar.
 */
const Register: React.FC = () => {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const { register: authRegister, isLoading: authIsLoading } = useAuth();
  const toast = useToast();

  // ===== STATE =====
  const [error, setError] = useState<string>('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');

  // ===== EFFECTS =====
  /**
   * Captcha konfigürasyonunu yükle
   */
  useEffect(() => {
    const loadCaptchaConfig = async () => {
      try {
        const response = await captchaAPI.getConfig();
        if (response.success && response.data.enabled && response.data.siteKey) {
          setCaptchaEnabled(true);
          setCaptchaSiteKey(response.data.siteKey);
        }
      } catch (error) {
        console.warn('Captcha config yüklenemedi:', error);
      }
    };

    loadCaptchaConfig();
  }, []);

  // ===== EVENT HANDLERS =====
  /**
   * Form submit handler
   */
  const handleFormSubmit = async (formData: any) => {
    try {
      setError('');
      
      console.log('🚀 Register attempt:', formData.email);

      // RegisterRequest formatına dönüştür
      const registerData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // Authentication context üzerinden register işlemi
      await authRegister(registerData);
      
      console.log('✅ Register successful, redirecting to login...');
      
      // Başarılı kayıt sonrası login sayfasına yönlendir
      toast.showSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      navigate('/login');
      
    } catch (error: any) {
      // Hata mesajını kullanıcıya göster
      const errorMessage = error.response?.data?.message || error.message || 'Kayıt olunurken bir hata oluştu';
      setError(errorMessage);
      toast.showError(errorMessage);
      console.error('❌ Register error:', error);
    }
  };

  // ===== RENDER =====
  return (
    <AuthLayout
      title="Hesap Oluştur"
      description="TaskFlow'a katılın ve görevlerinizi organize edin"
    >
      <div className="space-y-6">
        {/* Main Register Form */}
        <RegisterForm
          onSubmit={handleFormSubmit}
          isLoading={authIsLoading}
          error={error}
          captchaEnabled={captchaEnabled}
          captchaSiteKey={captchaSiteKey}
        />

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zaten hesabınız var mı?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
