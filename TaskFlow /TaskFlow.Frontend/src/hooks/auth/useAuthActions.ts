/**
 * Auth Actions Hook
 * 
 * Authentication actions (login, register, logout) hook'u.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenManager } from '../../services/api';
import type { LoginRequest, RegisterRequest, User } from '../../types/auth.types';
import { useToast } from '../useToast';

/**
 * Auth Actions Interface
 */
interface AuthActionsOptions {
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  clearUser: () => void;
}

/**
 * Auth Actions Return Interface
 */
interface AuthActionsReturn {
  login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  socialLogin: (provider: "google" | "apple" | "microsoft") => Promise<any>;
}

/**
 * useAuthActions - Authentication actions hook
 * 
 * Login, register, logout ve social login işlemlerini yöneten hook.
 * API çağrıları ve state güncellemelerini merkezi olarak yönetir.
 * 
 * @param options - Auth state management fonksiyonları
 * @returns Authentication action fonksiyonları
 */
export const useAuthActions = (options: AuthActionsOptions): AuthActionsReturn => {
  const { setUser, setIsLoading, clearUser } = options;
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  /**
   * Login işlemi
   */
  const login = useCallback(async (credentials: LoginRequest, rememberMe: boolean) => {
    try {
      setIsLoading(true);
      console.log('🚀 Login attempt for:', credentials.email);

      const response = await authAPI.login({
        ...credentials,
        rememberMe,
      });

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Token'ları kaydet
        tokenManager.setToken(accessToken, rememberMe);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken, rememberMe);
        }

        // User state'ini güncelle
        setUser(user);
        
        console.log('✅ Login successful for:', user.email);
        showSuccess('Giriş başarılı! Hoş geldiniz.');
        
        // Dashboard'a yönlendir
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Giriş işlemi başarısız');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading, navigate, showSuccess, showError]);

  /**
   * Register işlemi
   */
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      console.log('🚀 Register attempt for:', userData.email);

      const response = await authAPI.register(userData);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Token'ları kaydet
        tokenManager.setToken(accessToken, true); // Register'da default olarak remember me
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken, true);
        }

        // User state'ini güncelle
        setUser(user);
        
        console.log('✅ Registration successful for:', user.email);
        showSuccess('Kayıt başarılı! Hoş geldiniz.');
        
        // Dashboard'a yönlendir
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Kayıt işlemi başarısız');
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kayıt olurken bir hata oluştu';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading, navigate, showSuccess, showError]);

  /**
   * Logout işlemi
   */
  const logout = useCallback(() => {
    try {
      console.log('🚀 Logout initiated');
      
      // API'ye logout isteği gönder (optional)
      authAPI.logout().catch(error => {
        console.warn('⚠️ Logout API call failed:', error);
      });

      // Token'ları temizle
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();

      // User state'ini temizle
      clearUser();
      
      console.log('✅ Logout successful');
      showInfo('Çıkış yapıldı. Görüşmek üzere!');
      
      // Login sayfasına yönlendir
      navigate('/auth/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      showError('Çıkış yapılırken bir hata oluştu');
    }
  }, [clearUser, navigate, showInfo, showError]);

  /**
   * Social login işlemi
   */
  const socialLogin = useCallback(async (provider: "google" | "apple" | "microsoft") => {
    try {
      setIsLoading(true);
      console.log('🚀 Social login attempt with:', provider);

      // Social login implementation would go here
      // This is a placeholder for future implementation
      
      showInfo(`${provider} ile giriş yakında kullanılabilir olacak`);
      
      return { success: false, message: 'Not implemented yet' };
    } catch (error) {
      console.error('❌ Social login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sosyal medya girişi başarısız';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showInfo, showError]);

  return {
    login,
    register,
    logout,
    socialLogin,
  };
}; 