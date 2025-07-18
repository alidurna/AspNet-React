/** @type {import('tailwindcss').Config} */

/**
 * Tailwind CSS Konfigürasyon Dosyası - TaskFlow Frontend
 *
 * Bu dosya, TaskFlow uygulaması için özelleştirilmiş Tailwind CSS ayarlarını içerir.
 * Modern, profesyonel ve kullanıcı dostu bir tasarım sistemi oluşturmak için
 * custom renkler, fontlar, animasyonlar ve component sınıfları tanımlanmıştır.
 *
 * Ana Özellikler:
 * - Custom renk paleti (primary, secondary, success, warning, error)
 * - Inter font family entegrasyonu
 * - Custom animasyonlar (fade-in, slide-up, pulse)
 * - Responsive breakpoint'ler
 * - Dark mode desteği (future feature)
 *
 * Kullanım Alanları:
 * - Authentication sayfaları (Login/Register)
 * - Dashboard ve task management
 * - Form component'leri
 * - Button ve input component'leri
 * - Card ve layout component'leri
 */
module.exports = {
  // ===== CONTENT PATHS =====
  // Tailwind CSS'in hangi dosyalarda sınıf arayacağını belirtir
  content: [
    "./index.html", // Ana HTML dosyası
    "./src/**/*.{js,ts,jsx,tsx}", // Tüm React component'leri ve sayfalar
  ],

  // ===== THEME CUSTOMIZATION =====
  theme: {
    extend: {
      // ===== CUSTOM COLORS =====
      // TaskFlow uygulaması için özel renk paleti
      colors: {
        // Primary renk paleti - Ana marka rengi (daha soft mavi tonları)
        primary: {
          50: "#e0f2fe", // Çok açık soft mavi
          100: "#bae6fd",
          200: "#7dd3fc",
          300: "#38bdf8",
          400: "#0ea5e9",
          500: "#0284c7", // Ana soft mavi
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#082f49",
        },

        // Secondary renk paleti - İkincil vurgu rengi (pastel yeşil tonları)
        secondary: {
          50: "#ecfdf5", // Çok açık pastel yeşil
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#059669", // Ana soft yeşil
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#022c22",
        },

        // Neutral renk paleti - Genel arka plan, metin ve kenarlıklar için soft gri tonları
        neutral: {
          50: "#fafafa", // Çok açık gri - neredeyse beyaz
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373", // Orta gri
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717", // Çok koyu gri
        },

        // Success renk paleti - Başarı mesajları için (yeşil tonları)
        success: {
          50: "#f0fdf4", // En açık ton
          100: "#dcfce7", // Açık ton
          200: "#bbf7d0", // Orta açık ton
          300: "#86efac", // Orta ton
          400: "#4ade80", // Orta koyu ton
          500: "#22c55e", // Ana renk
          600: "#16a34a", // Koyu ton
          700: "#15803d", // Daha koyu ton
          800: "#166534", // Çok koyu ton
          900: "#14532d", // En koyu ton
        },

        // Warning renk paleti - Uyarı mesajları için (sarı/turuncu tonları)
        warning: {
          50: "#fffbeb", // En açık ton
          100: "#fef3c7", // Açık ton
          200: "#fde68a", // Orta açık ton
          300: "#fcd34d", // Orta ton
          400: "#fbbf24", // Orta koyu ton
          500: "#f59e0b", // Ana renk
          600: "#d97706", // Koyu ton
          700: "#b45309", // Daha koyu ton
          800: "#92400e", // Çok koyu ton
          900: "#78350f", // En koyu ton
        },

        // Error renk paleti - Hata mesajları için (kırmızı tonları)
        error: {
          50: "#fef2f2", // En açık ton
          100: "#fee2e2", // Açık ton
          200: "#fecaca", // Orta açık ton
          300: "#fca5a5", // Orta ton
          400: "#f87171", // Orta koyu ton
          500: "#ef4444", // Ana renk
          600: "#dc2626", // Koyu ton
          700: "#b91c1c", // Daha koyu ton
          800: "#991b1b", // Çok koyu ton
          900: "#7f1d1d", // En koyu ton
        },
      },

      // ===== FONT FAMILY =====
      // Google Fonts'tan Inter font family'si
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Default sans-serif font
      },

      // ===== CUSTOM ANIMATIONS =====
      // Smooth ve modern animasyonlar
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out", // Yumuşak görünme animasyonu
        "slide-up": "slideUp 0.3s ease-out", // Aşağıdan yukarı kayma
        "pulse-slow": "pulse 3s ease-in-out infinite", // Yavaş nabız efekti
      },

      // ===== KEYFRAMES =====
      // Animation keyframe tanımları
      keyframes: {
        // Fade in animasyonu - opacity 0'dan 1'e
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Slide up animasyonu - aşağıdan yukarı kayma
        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      // ===== RESPONSIVE BREAKPOINTS =====
      // Custom responsive breakpoint'ler (gerekirse)
      screens: {
        xs: "475px", // Extra small screens
        // sm: '640px',  // Default Tailwind
        // md: '768px',  // Default Tailwind
        // lg: '1024px', // Default Tailwind
        // xl: '1280px', // Default Tailwind
        // 2xl: '1536px' // Default Tailwind
      },

      // ===== BOX SHADOW =====
      // Custom gölge efektleri
      boxShadow: {
        soft: "0 2px 15px 0 rgba(0, 0, 0, 0.1)", // Yumuşak gölge
        medium: "0 4px 25px 0 rgba(0, 0, 0, 0.15)", // Orta gölge
        strong: "0 8px 40px 0 rgba(0, 0, 0, 0.2)", // Güçlü gölge
      },

      // ===== BORDER RADIUS =====
      // Custom border radius değerleri
      borderRadius: {
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem", // 32px
      },
    },
  },

  // ===== PLUGINS =====
  // Tailwind CSS plugin'leri
  plugins: [
    // @tailwindcss/forms - Form element'leri için özelleştirilmiş stiller
    // @tailwindcss/typography - Prose content için typography
    // @tailwindcss/aspect-ratio - Aspect ratio utilities
    // Bu plugin'ler gerektiğinde eklenebilir
  ],

  // ===== DARK MODE =====
  // Dark mode konfigürasyonu (future feature)
  darkMode: "class", // class-based dark mode (manuel toggle)
  // darkMode: 'media', // system preference based
};
