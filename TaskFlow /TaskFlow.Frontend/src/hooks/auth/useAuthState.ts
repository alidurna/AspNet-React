/**
 * Auth State Hook
 * 
 * Authentication state management hook'u.
 */

import { useState, useCallback } from 'react';
import type { User } from '../../types/auth.types';

/**
 * Auth State Interface
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Auth State Actions Interface
 */
interface AuthStateActions {
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

/**
 * useAuthState - Authentication state management
 * 
 * Auth state'ini yöneten hook. User bilgileri, loading durumu ve
 * authentication durumunu merkezi olarak yönetir.
 * 
 * @returns Auth state ve state management fonksiyonları
 */
export const useAuthState = (): AuthState & AuthStateActions => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(true);

  // Computed property: isAuthenticated
  const isAuthenticated = Boolean(user);

  /**
   * Set user with validation
   */
  const setUser = useCallback((newUser: User | null) => {
    console.log('🔄 Setting user:', newUser ? `${newUser.firstName} ${newUser.lastName}` : 'null');
    setUserState(newUser);
  }, []);

  /**
   * Set loading state
   */
  const setIsLoading = useCallback((loading: boolean) => {
    console.log('⏳ Setting loading state:', loading);
    setIsLoadingState(loading);
  }, []);

  /**
   * Update user partially
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUserState(currentUser => {
      if (!currentUser) {
        console.warn('⚠️ Attempted to update user when no user is logged in');
        return null;
      }

      const updatedUser = { ...currentUser, ...updates };
      console.log('🔄 Updating user:', updates);
      return updatedUser;
    });
  }, []);

  /**
   * Clear user and reset state
   */
  const clearUser = useCallback(() => {
    console.log('🗑️ Clearing user state');
    setUserState(null);
    setIsLoadingState(false);
  }, []);

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    setUser,
    setIsLoading,
    updateUser,
    clearUser,
  };
}; 