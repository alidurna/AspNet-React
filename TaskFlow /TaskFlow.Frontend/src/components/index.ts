// ===== UI COMPONENTS =====
export { default as Button } from './ui/Button';
export { default as Card } from './ui/Card';
export { default as Input } from './ui/Input';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as Toast, ToastProvider } from './ui/Toast';
export { default as ThemeToggle } from './ui/ThemeToggle';
export { default as ConfirmModal } from './ui/ConfirmModal';
export { default as Dialog } from './ui/Dialog';
export { default as Skeleton } from './ui/Skeleton';
export { default as StatsCard } from './ui/StatsCard';
export { default as PasswordStrength } from './ui/PasswordStrength';
export { default as ProgressiveDisclosure } from './ui/ProgressiveDisclosure';
export { default as PWAInstallBanner } from './ui/PWAInstallBanner';

// ===== LAYOUT COMPONENTS =====
export { default as AuthLayout } from './layout/AuthLayout';
export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as Header } from './layout/Header';
export { default as Sidebar } from './layout/Sidebar';

// ===== COMMON COMPONENTS =====
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as ProtectedRoute } from './common/ProtectedRoute';

// ===== AUTH COMPONENTS =====
export { default as SocialLogin } from './auth/SocialLogin';
export { default as TwoFactorLogin } from './auth/TwoFactorLogin';
export { default as WebAuthnLogin } from './auth/WebAuthnLogin';
export { default as WebAuthnSetup } from './auth/WebAuthnSetup';

// ===== TASK COMPONENTS =====
export { default as KanbanBoard } from './tasks/KanbanBoard';
export { default as ProgressSlider } from './tasks/ProgressSlider';
export { default as TaskCard } from './tasks/TaskCard';
export { default as TaskFilters } from './tasks/TaskFilters';
export { default as TaskModal } from './tasks/TaskModal';

// ===== DASHBOARD COMPONENTS (REFACTORED) =====
export { default as AnalyticsDashboard } from './dashboard/AnalyticsDashboard';
export { default as TaskCompletionChart } from './dashboard/TaskCompletionChart';
export { default as DashboardStats } from './dashboard/DashboardStats';
export { default as DashboardRecentTasks } from './dashboard/DashboardRecentTasks';
export { default as DashboardQuickActions } from './dashboard/DashboardQuickActions';

// ===== PROFILE COMPONENTS (REFACTORED) =====
export { default as ProfileHeader } from './profile/ProfileHeader';
export { default as ProfileForm } from './profile/ProfileForm';
export { default as ProfileStats } from './profile/ProfileStats';

// ===== SECURITY COMPONENTS =====
export { default as Captcha } from './security/Captcha';
export { default as TwoFactorAuth } from './security/TwoFactorAuth';
export { default as WebAuthn } from './security/WebAuthn';

// ===== SEARCH COMPONENTS =====
export { default as AdvancedSearchModal } from './search/AdvancedSearchModal';

// ===== PERFORMANCE COMPONENTS =====
export { default as LazyRoutes } from './performance/LazyRoutes';

// ===== DEMO COMPONENTS =====
export { default as ToastDemo } from './demo/ToastDemo'; 