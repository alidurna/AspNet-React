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
        // Primary renk paleti - Ana marka rengi (mavi tonları)
        primary: {
          50: "#eff6ff", // En açık ton - background'lar için
          100: "#dbeafe", // Açık ton - hover state'ler için
          200: "#bfdbfe", // Orta açık ton
          300: "#93c5fd", // Orta ton
          400: "#60a5fa", // Orta koyu ton
          500: "#3b82f6", // Ana renk - buttonlar için
          600: "#2563eb", // Koyu ton - hover state'ler için
          700: "#1d4ed8", // Daha koyu ton
          800: "#1e40af", // Çok koyu ton
          900: "#1e3a8a", // En koyu ton - text için
        },

        // Secondary renk paleti - İkincil vurgu rengi (mor tonları)
        secondary: {
          50: "#faf5ff", // En açık ton
          100: "#f3e8ff", // Açık ton
          200: "#e9d5ff", // Orta açık ton
          300: "#d8b4fe", // Orta ton
          400: "#c084fc", // Orta koyu ton
          500: "#a855f7", // Ana renk
          600: "#9333ea", // Koyu ton
          700: "#7c3aed", // Daha koyu ton
          800: "#6b21a8", // Çok koyu ton
          900: "#581c87", // En koyu ton
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
