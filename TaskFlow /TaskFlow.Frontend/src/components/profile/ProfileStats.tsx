/**
 * ProfileStats Component
 * 
 * Kullanıcının profil istatistiklerini gösteren component.
 * Görev sayıları, tamamlama oranları ve diğer metrikleri görüntüler.
 */

import React from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt, FaChartLine, FaTrophy } from 'react-icons/fa';

interface ProfileStatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  memberSince: string;
  lastLoginDate: string;
  streakDays: number;
}

interface ProfileStatsProps {
  stats: ProfileStatsData;
  isLoading?: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  isLoading = false
}) => {
  /**
   * Tamamlama oranına göre renk döndürür
   */
  const getCompletionRateColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  /**
   * Streak durumuna göre renk döndürür
   */
  const getStreakColor = (days: number): string => {
    if (days >= 7) return 'text-purple-600 dark:text-purple-400';
    if (days >= 3) return 'text-blue-600 dark:text-blue-400';
    if (days >= 1) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  /**
   * Tarih formatı
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            İstatistikler
          </h3>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaChartLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          İstatistikler
        </h3>
      </div>

      <div className="space-y-6">
        {/* Görev İstatistikleri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FaTasks className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Toplam Görev
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FaCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completedTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tamamlanan
            </div>
          </div>
        </div>

        {/* Tamamlama Oranı */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tamamlama Oranı
            </span>
            <span className={`text-sm font-bold ${getCompletionRateColor(stats.completionRate)}`}>
              %{stats.completionRate}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.completionRate >= 80 ? 'bg-green-500' :
                stats.completionRate >= 60 ? 'bg-blue-500' :
                stats.completionRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Bekleyen ve Geciken Görevler */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <FaClock className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {stats.pendingTasks}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Bekleyen
            </div>
          </div>

          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <FaCalendarAlt className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {stats.overdueTasks}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Geciken
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <FaTrophy className={`w-6 h-6 mx-auto mb-2 ${getStreakColor(stats.streakDays)}`} />
          <div className={`text-2xl font-bold ${getStreakColor(stats.streakDays)}`}>
            {stats.streakDays}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Günlük Seri
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {stats.streakDays > 0 ? 'Harika gidiyorsun!' : 'Yeni bir seri başlat!'}
          </div>
        </div>

        {/* Üyelik Bilgileri */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Üyelik Tarihi:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatDate(stats.memberSince)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Son Giriş:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatDate(stats.lastLoginDate)}
            </span>
          </div>
        </div>

        {/* Motivasyon Mesajı */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="text-sm text-center">
            {stats.completionRate >= 80 ? (
              <span className="text-green-700 dark:text-green-300 font-medium">
                🎉 Mükemmel performans! Böyle devam et!
              </span>
            ) : stats.completionRate >= 60 ? (
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                💪 Çok iyi gidiyorsun! Biraz daha gayret!
              </span>
            ) : stats.completionRate >= 40 ? (
              <span className="text-orange-700 dark:text-orange-300 font-medium">
                📈 İlerleme kaydediyorsun! Devam et!
              </span>
            ) : (
              <span className="text-red-700 dark:text-red-300 font-medium">
                🚀 Yeni başlangıçlar için harika zaman!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats; 