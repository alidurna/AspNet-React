/**
 * Lazy Pages - Code Splitting
 * 
 * Tüm sayfa componentlerini lazy loading ile yükler.
 * Bundle size'ı optimize eder ve performansı artırır.
 */

import { lazy } from 'react';

// ===== AUTH PAGES =====
export const LoginPage = lazy(() => import('../../pages/Login'));
export const RegisterPage = lazy(() => import('../../pages/Register'));
export const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPassword'));
export const ResetPasswordPage = lazy(() => import('../../pages/ResetPassword'));

// ===== MAIN PAGES =====
export const DashboardPage = lazy(() => import('../../pages/Dashboard'));
export const TasksPage = lazy(() => import('../../pages/Tasks'));
export const CategoriesPage = lazy(() => import('../../pages/Categories'));
export const ProfilePage = lazy(() => import('../../pages/Profile'));
export const SecurityPage = lazy(() => import('../../pages/Security'));
export const StatisticsPage = lazy(() => import('../../pages/Statistics'));

// ===== REFACTORED PAGES =====
export const TasksRefactoredPage = lazy(() => import('../../pages/Tasks-Refactored'));

// ===== FALLBACK COMPONENT =====
export const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Sayfa yükleniyor...</p>
    </div>
  </div>
);

// ===== CHUNK NAMES =====
/*
Webpack chunk names for better debugging:
- auth-login: Login page
- auth-register: Register page  
- auth-forgot: Forgot password page
- auth-reset: Reset password page
- main-dashboard: Dashboard page
- main-tasks: Tasks page
- main-categories: Categories page
- main-profile: Profile page
- main-security: Security page
- main-statistics: Statistics page
*/ 