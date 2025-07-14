/**
 * Theme Toggle Component
 *
 * Bu dosya, koyu/açık tema değiştirme butonu bileşenini içerir.
 * Modern ve erişilebilir tema toggle özelliği sağlar.
 *
 * Ana Özellikler:
 * - Koyu/açık tema geçişi
 * - Animasyonlu ikon değişimi
 * - Erişilebilirlik desteği
 * - Responsive tasarım
 * - Hover ve focus efektleri
 *
 * Tema Durumları:
 * - Light: Güneş ikonu
 * - Dark: Ay ikonu
 * - System: Sistem ikonu
 *
 * Erişilebilirlik:
 * - ARIA label ve description
 * - Keyboard navigation
 * - Screen reader desteği
 * - Focus indicators
 *
 * Animasyonlar:
 * - Smooth icon transitions
 * - Hover effects
 * - Focus ring animations
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Theme Toggle Component Props Interface
 */
interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * Theme Toggle Component
 *
 * Koyu/açık tema değiştirme butonu.
 * Animasyonlu ikonlar ve erişilebilir tasarım.
 *
 * @param className - Ek CSS sınıfları
 * @param size - Buton boyutu (sm, md, lg)
 * @param showLabel - Label gösterilsin mi?
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
  showLabel = false,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  // Boyut bazlı stil sınıfları
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  // Tema durumuna göre ikon ve label
  const getThemeInfo = () => {
    if (theme === "system") {
      return {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
        label: "Sistem teması",
        description: "Sistem temasını takip et",
      };
    }

    if (isDark) {
      return {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ),
        label: "Koyu tema",
        description: "Açık temaya geç",
      };
    }

    return {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      label: "Açık tema",
      description: "Koyu temaya geç",
    };
  };

  const themeInfo = getThemeInfo();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center rounded-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={themeInfo.label}
      aria-describedby="theme-toggle-description"
      title={themeInfo.description}
    >
      {/* Tema ikonu */}
      <div className="transition-transform duration-200 hover:scale-110">
        {themeInfo.icon}
      </div>

      {/* Label (opsiyonel) */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium hidden sm:inline">
          {themeInfo.label}
        </span>
      )}

      {/* Screen reader açıklaması */}
      <div id="theme-toggle-description" className="sr-only">
        {themeInfo.description}
      </div>
    </button>
  );
};

export default ThemeToggle; 