/**
 * Login Page - Clean Structure
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading: authIsLoading } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      await login({ email: formData.email, password: formData.password }, rememberMe);
      navigate('/dashboard');
      toast.showSuccess('Başarıyla giriş yaptınız!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      toast.showError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="TaskFlow'a Hoş Geldiniz"
      description="Hesabınıza giriş yapın ve görevlerinizi yönetin"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
            Email Adresi
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ornek@email.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={authIsLoading}
            autoComplete="email"
            className="w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
            Şifre
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={handleInputChange}
              disabled={authIsLoading}
              autoComplete="current-password"
              className="w-full pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={authIsLoading}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={authIsLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded-md"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
              Beni hatırla
            </label>
          </div>
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={authIsLoading || !formData.email || !formData.password}
          className="w-full"
          variant="default"
        >
          {authIsLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Giriş yapılıyor...</span>
            </>
          ) : (
            'Giriş Yap'
          )}
        </Button>
      </form>

      {/* Biyometrik Giriş - Form Dışında */}
      <Button
        type="button"
        disabled={authIsLoading}
        className="w-full mt-4"
        variant="outline"
        onClick={() => {
          toast.showInfo('Biyometrik giriş özelliği yakında aktif olacak!');
        }}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
        </svg>
        Biyometrik Giriş
      </Button>

      {/* Sosyal Medya Giriş - Form Dışında */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              veya şunlarla giriş yapın
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => {
              toast.showInfo('Google ile giriş özelliği yakında aktif olacak!');
            }}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile devam et
          </button>

          <button
            type="button"
            onClick={() => {
              toast.showInfo('Apple ile giriş özelliği yakında aktif olacak!');
            }}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="#000000" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.4-2.35 1.05-3.11z"/>
            </svg>
            Apple ile devam et
          </button>

          <button
            type="button"
            onClick={() => {
              toast.showInfo('Microsoft ile giriş özelliği yakında aktif olacak!');
            }}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft ile devam et
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Sosyal medya hesaplarınızla güvenli giriş yapın. Verileriniz korunur ve paylaşılmaz.
        </p>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login; 