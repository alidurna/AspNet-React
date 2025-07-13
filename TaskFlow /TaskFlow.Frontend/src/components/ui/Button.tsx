/**
 * Button Component
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş yeniden kullanılabilir
 * buton component'ini içerir. Modern UI/UX prensipleri ve accessibility
 * standartları gözetilerek geliştirilmiştir.
 *
 * Ana Özellikler:
 * - 4 farklı varyant (primary, secondary, outline, ghost)
 * - 3 farklı boyut (sm, md, lg)
 * - Loading state (spinner animasyonu)
 * - Sol/sağ ikon desteği
 * - Accessibility (ARIA) desteği
 * - Hover/focus animasyonları
 * - Disabled state yönetimi
 * - TypeScript tip güvenliği
 *
 * Varyantlar:
 * - Primary: Ana aksiyonlar için mavi buton
 * - Secondary: İkincil aksiyonlar için gri buton
 * - Outline: Çerçeveli, şeffaf arka plan
 * - Ghost: Sadece metin, minimal tasarım
 *
 * Boyutlar:
 * - sm: Küçük butonlar (px-3 py-1.5)
 * - md: Orta boyut (px-4 py-2) - varsayılan
 * - lg: Büyük butonlar (px-6 py-3)
 *
 * Accessibility:
 * - Keyboard navigation desteği
 * - Screen reader uyumluluğu
 * - Focus indicators
 * - ARIA labels desteği
 *
 * Performans:
 * - Optimized re-renders
 * - Efficient CSS classes
 * - Minimal bundle size
 *
 * Sürdürülebilirlik:
 * - TypeScript ile tip güvenliği
 * - Modüler CSS yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive prop interface
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from "react";

/**
 * Button Component Props Interface
 * HTML button elementinin tüm özelliklerini extend eder
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"; // Buton çeşidi/stili
  size?: "sm" | "md" | "lg"; // Buton boyutu
  isLoading?: boolean; // Yükleniyor durumu (spinner gösterir)
  leftIcon?: React.ReactNode; // Sol taraftaki ikon
  rightIcon?: React.ReactNode; // Sağ taraftaki ikon
  children: React.ReactNode; // Buton içeriği (metin)
}

/**
 * Reusable Button Component
 *
 * TaskFlow uygulaması için özelleştirilmiş buton component'i.
 * Farklı varyant ve boyutlarda kullanılabilir.
 *
 * Özellikler:
 * - 4 farklı varyant (primary, secondary, outline, ghost)
 * - 3 farklı boyut (sm, md, lg)
 * - Loading state (spinner ile)
 * - Sol/sağ ikon desteği
 * - Accessibility desteği
 * - Hover/focus animasyonları
 * - Disabled state desteği
 *
 * @param props - Button component özellikleri
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary", // Varsayılan: primary mavi buton
  size = "md", // Varsayılan: orta boyut
  isLoading = false, // Varsayılan: yükleniyor değil
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props // Diğer tüm HTML button props'ları
}) => {
  // ===== CSS CLASS TANIMLARI =====

  // Tüm butonlar için ortak temel stil sınıfları
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Varyant bazlı renk ve stil sınıfları
  const variantClasses = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500", // Mavi primary buton
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-secondary-500", // Gri secondary buton
    outline:
      "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500", // Çerçeveli buton
    ghost: "text-primary-600 hover:bg-primary-50 focus:ring-primary-500", // Sadece metin buton
  };

  // Boyut bazlı padding ve font sınıfları
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm", // Küçük buton
    md: "px-4 py-2 text-base", // Orta buton
    lg: "px-6 py-3 text-lg", // Büyük buton
  };

  // Buton disabled mi? (loading durumunda da disabled sayılır)
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isLoading ? "cursor-wait" : ""} // Loading durumunda wait cursor
        ${className} // Dışarıdan gelen ek class'lar
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        // ===== LOADING STATE =====
        // Spinner ikonu ve "Yükleniyor..." metni
        <>
          {/* Dönen spinner ikonu */}
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            {/* Spinner dış çemberi (soluk) */}
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Spinner aktif kısmı (parlak) */}
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Yükleniyor...
        </>
      ) : (
        // ===== NORMAL STATE =====
        // Sol ikon + içerik + sağ ikon
        <>
          {/* Sol taraf ikonu (varsa) */}
          {leftIcon && <span className="mr-2">{leftIcon}</span>}

          {/* Ana buton içeriği (metin) */}
          {children}

          {/* Sağ taraf ikonu (varsa) */}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
