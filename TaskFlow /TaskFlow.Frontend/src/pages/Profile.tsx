/**
 * Profile Page - Refactored Version
 * 
 * Bu dosya, profil yönetimi sayfasının refactored edilmiş halidir.
 * Mega dosya sorunu çözülmüş, küçük ve yönetilebilir componentlere bölünmüştür.
 * 
 * Ana Özellikler:
 * - Modüler component yapısı
 * - Clean code principles
 * - Separation of concerns
 * - Better maintainability
 * - Improved performance
 * 
 * @version 3.0.0 - Refactored
 */

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Refactored Components
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileStats from "../components/profile/ProfileStats";

// Shared Components
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../hooks/useToast";

// API Services (modular)
import { userAPI } from "../services/api";

/**
 * Profile Page Component
 */
const Profile: React.FC = () => {
  // ===== HOOKS =====
  const toast = useToast();
  const queryClient = useQueryClient();

  // ===== DATA FETCHING =====
  const { data: profileResponse, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.getProfile(),
  });

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userAPI.getUserStats(),
  });

  const profile = profileResponse?.data;
  const stats = statsResponse?.data;

  // ===== MUTATIONS =====
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => userAPI.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.showSuccess('Profil bilgileri başarıyla güncellendi!');
    },
    onError: (error: any) => {
      toast.showError('Profil güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  });

  // ===== EVENT HANDLERS =====
  const handleProfileSubmit = (formData: any) => {
    updateProfileMutation.mutate(formData);
  };

  // ===== LOADING & ERROR STATES =====
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600">Profil bilgileri yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  // ===== DATA PREPARATION =====
  const profileFormData = {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || ''
  };

  const profileStatsData = {
    totalTasks: stats?.totalTasks || 0,
    completedTasks: stats?.completedTasks || 0,
    pendingTasks: stats?.pendingTasks || 0,
    overdueTasks: stats?.overdueTasks || 0,
    completionRate: stats?.completionRate || 0,
    memberSince: profile.createdAt || new Date().toISOString(),
    lastLoginDate: profile.lastLoginAt || new Date().toISOString(),
    streakDays: stats?.streakDays || 0
  };

  // ===== RENDER =====
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <ProfileHeader
        userName={`${profile.firstName} ${profile.lastName}`.trim() || 'Kullanıcı'}
        userEmail={profile.email}
        isEmailVerified={profile.isEmailVerified || false}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Sütun: Profil Formu */}
        <div className="lg:col-span-2">
          <ProfileForm
            initialData={profileFormData}
            onSubmit={handleProfileSubmit}
            isLoading={updateProfileMutation.isPending}
          />
        </div>

        {/* Sağ Sütun: İstatistikler */}
        <div className="lg:col-span-1">
          <ProfileStats
            stats={profileStatsData}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Alt Bölüm: Ek Özellikler (gelecekte eklenebilir) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Güvenlik Ayarları Kartı */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Güvenlik Ayarları
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">İki Faktörlü Doğrulama</span>
              <span className="text-sm text-red-600 dark:text-red-400">Kapalı</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">WebAuthn</span>
              <span className="text-sm text-red-600 dark:text-red-400">Kapalı</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Son Şifre Değişikliği</span>
              <span className="text-sm text-gray-900 dark:text-white">30 gün önce</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Güvenlik ayarlarını yönet →
            </button>
          </div>
        </div>

        {/* Hesap Ayarları Kartı */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hesap Ayarları
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hesap Durumu</span>
              <span className="text-sm text-green-600 dark:text-green-400">Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bildirimler</span>
              <span className="text-sm text-green-600 dark:text-green-400">Açık</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tema</span>
              <span className="text-sm text-gray-900 dark:text-white">Sistem</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Hesap ayarlarını yönet →
            </button>
          </div>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hesabınızla ilgili sorunuz mu var?{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            Destek ekibiyle iletişime geçin
          </button>
        </p>
      </div>
    </div>
  );
};

export default Profile; 