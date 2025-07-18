/**
 * TaskFlow Tema Konfigürasyonu
 *
 * Bu dosya, TaskFlow uygulaması için tutarlı bir tasarım sistemi
 * sağlamak amacıyla ortak tema değerlerini içerir.
 *
 * Ana Özellikler:
 * - Renk paleti (primary, secondary, neutral, success, warning, error)
 * - Spacing değerleri
 * - Typography ayarları
 * - Border radius değerleri
 * - Shadow efektleri
 * - Animation süreleri
 *
 * Kullanım Alanları:
 * - Component'lerde tutarlı renk kullanımı
 * - Layout'larda ortak spacing
 * - Form element'lerinde standart stiller
 * - Button ve input component'lerinde tema uyumu
 */

export const theme = {
  // ===== RENK PALETİ =====
  colors: {
    // Primary renk paleti - Ana marka rengi (soft mavi tonları)
    primary: {
      50: "#e0f2fe",
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
      50: "#ecfdf5",
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
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Ana renk
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },

    // Warning renk paleti - Uyarı mesajları için (sarı/turuncu tonları)
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // Ana renk
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },

    // Error renk paleti - Hata mesajları için (kırmızı tonları)
    error: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // Ana renk
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },

  // ===== SPACING =====
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem",  // 8px
    md: "1rem",    // 16px
    lg: "1.5rem",  // 24px
    xl: "2rem",    // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // ===== TYPOGRAPHY =====
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: "0.75rem",   // 12px
      sm: "0.875rem",  // 14px
      base: "1rem",    // 16px
      lg: "1.125rem",  // 18px
      xl: "1.25rem",   // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  // ===== BORDER RADIUS =====
  borderRadius: {
    none: "0",
    sm: "0.125rem",   // 2px
    base: "0.25rem",  // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    "3xl": "1.5rem",  // 24px
    full: "9999px",
  },

  // ===== SHADOWS =====
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    soft: "0 2px 15px 0 rgba(0, 0, 0, 0.1)",
    medium: "0 4px 25px 0 rgba(0, 0, 0, 0.15)",
    strong: "0 8px 40px 0 rgba(0, 0, 0, 0.2)",
  },

  // ===== ANIMATIONS =====
  animations: {
    duration: {
      fast: "150ms",
      base: "200ms",
      slow: "300ms",
      slower: "500ms",
    },
    easing: {
      linear: "linear",
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },

  // ===== BREAKPOINTS =====
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Renk değerini almak için yardımcı fonksiyon
 * @param colorPath - Renk yolu (örn: "primary.500")
 * @returns Renk değeri
 */
export function getColor(colorPath: string): string {
  const path = colorPath.split(".");
  let value: any = theme.colors;
  
  for (const key of path) {
    value = value[key];
    if (!value) break;
  }
  
  return value || colorPath;
}

/**
 * Spacing değerini almak için yardımcı fonksiyon
 * @param size - Spacing boyutu
 * @returns Spacing değeri
 */
export function getSpacing(size: keyof typeof theme.spacing): string {
  return theme.spacing[size];
}

/**
 * Border radius değerini almak için yardımcı fonksiyon
 * @param size - Border radius boyutu
 * @returns Border radius değeri
 */
export function getBorderRadius(size: keyof typeof theme.borderRadius): string {
  return theme.borderRadius[size];
}

export default theme; 