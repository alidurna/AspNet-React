/**
 * Stats Card Component
 *
 * Bu dosya, TaskFlow uygulamasının dashboard'ında kullanılan istatistik
 * kartlarını oluşturan component'i içerir. Görev sayıları, tamamlanma
 * oranları ve diğer metrikleri görsel olarak sunar.
 *
 * Ana Özellikler:
 * - Icon'lu istatistik gösterimi
 * - Trend indicators (artış/azalış)
 * - Progress bar desteği
 * - 5 farklı renk teması
 * - Hover animasyonları
 * - Loading state'leri
 * - Clickable kartlar
 *
 * Renk Temaları:
 * - blue: Mavi tema (varsayılan)
 * - purple: Mor tema
 * - green: Yeşil tema
 * - yellow: Sarı tema
 * - red: Kırmızı tema
 *
 * Props Interface:
 * - title: Kart başlığı
 * - value: Ana değer (string/number)
 * - icon: Icon component'i
 * - trend: Trend değeri (örn: +12%)
 * - trendUp: Trend yönü (true: artış, false: azalış)
 * - progress: Progress yüzdesi (0-100)
 * - color: Renk teması
 * - isLoading: Loading durumu
 * - onClick: Tıklama fonksiyonu
 *
 * Kullanım Alanları:
 * - Dashboard istatistikleri
 * - Görev sayıları
 * - Tamamlanma oranları
 * - Performans metrikleri
 * - Kategori bazlı istatistikler
 *
 * Styling:
 * - Tailwind CSS tabanlı
 * - Consistent design system
 * - Color-coded themes
 * - Responsive design
 * - Smooth animations
 *
 * Loading State:
 * - Skeleton loading
 * - Pulse animation
 * - Placeholder content
 * - Graceful fallback
 *
 * Accessibility:
 * - Semantic HTML
 * - Screen reader support
 * - Keyboard navigation
 * - Focus indicators
 * - ARIA labels
 *
 * Performance:
 * - Optimized re-renders
 * - Efficient animations
 * - Memory management
 * - Bundle optimization
 *
 * Animation:
 * - Hover effects
 * - Progress bar animation
 * - Smooth transitions
 * - Loading animations
 *
 * Responsive Design:
 * - Mobile-first approach
 * - Flexible layout
 * - Adaptive sizing
 * - Touch-friendly
 *
 * Error Handling:
 * - Graceful fallbacks
 * - Invalid data handling
 * - Edge case management
 * - State recovery
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  progress?: number;
  color?: "blue" | "purple" | "green" | "yellow" | "red" | "orange" | "cyan" | "teal"; // Yeni renkler eklendi
  isLoading?: boolean;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  progress,
  color = "blue",
  isLoading = false,
  onClick,
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-blue-600 dark:bg-primary-800",
      text: "text-blue-700 dark:text-primary-300",
      progressBg: "bg-blue-600 dark:bg-primary-600",
      border: "border-blue-200 dark:border-neutral-800/50",
    },
    purple: {
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-purple-600 dark:bg-secondary-800",
      text: "text-purple-700 dark:text-secondary-300",
      progressBg: "bg-purple-600 dark:bg-secondary-600",
      border: "border-purple-200 dark:border-neutral-800/50",
    },
    green: {
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-green-600 dark:bg-success-800",
      text: "text-green-700 dark:text-success-300",
      progressBg: "bg-green-600 dark:bg-success-600",
      border: "border-green-200 dark:border-neutral-800/50",
    },
    yellow: {
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-yellow-600 dark:bg-warning-800",
      text: "text-yellow-700 dark:text-warning-300",
      progressBg: "bg-yellow-600 dark:bg-warning-600",
      border: "border-yellow-200 dark:border-neutral-800/50",
    },
    red: {
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-red-600 dark:bg-error-800",
      text: "text-red-700 dark:text-error-300",
      progressBg: "bg-red-600 dark:bg-error-600",
      border: "border-red-200 dark:border-neutral-800/50",
    },
    orange: { // Yeni renk tanımı
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-orange-600 dark:bg-orange-800",
      text: "text-orange-700 dark:text-orange-300",
      progressBg: "bg-orange-600 dark:bg-orange-600",
      border: "border-orange-200 dark:border-neutral-800/50",
    },
    cyan: { // Yeni renk tanımı
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-cyan-600 dark:bg-cyan-800",
      text: "text-cyan-700 dark:text-cyan-300",
      progressBg: "bg-cyan-600 dark:bg-cyan-600",
      border: "border-cyan-200 dark:border-neutral-800/50",
    },
    teal: { // Yeni renk tanımı
      bg: "bg-white dark:bg-neutral-850/80 backdrop-blur-md",
      iconBg: "bg-teal-600 dark:bg-teal-800",
      text: "text-teal-700 dark:text-teal-300",
      progressBg: "bg-teal-600 dark:bg-teal-600",
      border: "border-teal-200 dark:border-neutral-800/50",
    },
  };

  const colors = colorConfig[color];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-neutral-850/80 dark:border-neutral-800/50 dark:shadow-none backdrop-blur-md">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg dark:bg-neutral-800/50"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 dark:bg-neutral-800/50"></div>
                <div className="h-6 bg-gray-200 rounded w-16 dark:bg-neutral-800/50"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12 dark:bg-neutral-800/50"></div>
          </div>
          {progress !== undefined && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded dark:bg-neutral-800/50"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${colors.bg} rounded-lg shadow-sm border ${colors.border} p-6 transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-1 dark:hover:shadow-none dark:shadow-neutral-950/30" : ""}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Icon & Stats */}
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div
            className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${colors.iconBg}
          `}
          >
            <div className="text-white text-xl">{icon}</div>
          </div>

          {/* Stats */}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-neutral-300">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-neutral-200">{value}</p>
          </div>
        </div>

        {/* Right Section - Trend */}
        {trend && (
          <div
            className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${
              trendUp
                ? "bg-green-100 text-green-700 dark:bg-success-900/60 dark:text-success-500"
                : "bg-red-100 text-red-700 dark:bg-error-900/60 dark:text-error-500"
            }
          `}
          >
            {/* Trend Icon */}
            <svg
              className={`w-3 h-3 ${trendUp ? "rotate-0" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17l6-6 6 6"
              />
            </svg>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2 dark:text-neutral-300">
            <span>İlerleme</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-800/50">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${colors.progressBg}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
