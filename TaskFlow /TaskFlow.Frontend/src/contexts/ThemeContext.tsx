/**
 * Theme Context
 *
 * Bu dosya, TaskFlow uygulamasının tema yönetimi için context'i içerir.
 * Koyu/açık tema değiştirme özelliği ve sistem teması desteği sağlar.
 *
 * Ana Özellikler:
 * - Koyu/açık tema değiştirme
 * - Sistem teması otomatik algılama
 * - LocalStorage'da tema tercihi saklama
 * - Tema değişikliklerinde otomatik güncelleme
 * - TypeScript tip güvenliği
 *
 * Tema Modları:
 * - light: Açık tema
 * - dark: Koyu tema
 * - system: Sistem temasını takip et
 *
 * Kullanım:
 * - useTheme hook'u ile tema durumu ve değiştirme fonksiyonları
 * - ThemeProvider ile uygulama sarmalama
 * - CSS değişkenleri ile tema renkleri
 *
 * Performans:
 * - Optimized re-renders
 * - Efficient localStorage operations
 * - Minimal bundle impact
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Tema modları için tip tanımı
 */
type ThemeMode = "light" | "dark" | "system";

/**
 * Tema context'i için tip tanımı
 */
interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * Tema context'i oluşturma
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Tema provider props interface
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Tema Provider Component
 *
 * Uygulamanın tema yönetimini sağlayan provider component'i.
 * LocalStorage'da tema tercihini saklar ve sistem temasını algılar.
 *
 * Özellikler:
 * - Tema tercihini localStorage'da saklama
 * - Sistem teması otomatik algılama
 * - Tema değişikliklerinde DOM güncelleme
 * - TypeScript tip güvenliği
 *
 * @param children - Provider içindeki component'ler
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Tema durumu - localStorage'dan okur veya sistem temasını algılar
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // LocalStorage'dan tema tercihini oku
    const savedTheme = localStorage.getItem("taskflow-theme") as ThemeMode;
    
    // Eğer kaydedilmiş tema varsa onu kullan, yoksa sistem temasını takip et
    return savedTheme || "system";
  });

  // Gerçek tema durumu (koyu/açık)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  /**
   * Tema değiştirme fonksiyonu
   * Light -> Dark -> System -> Light döngüsü
   */
  const toggleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  /**
   * Belirli bir temaya geçiş fonksiyonu
   * @param newTheme - Yeni tema modu
   */
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("taskflow-theme", newTheme);
  };

  /**
   * Sistem teması değişikliklerini dinle
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        setIsDark(mediaQuery.matches);
      }
    };

    // Sistem teması değişikliklerini dinle
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  /**
   * Tema değişikliklerinde DOM'u güncelle
   */
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [isDark]);

  /**
   * Tema değişikliklerinde isDark state'ini güncelle
   */
  useEffect(() => {
    if (theme === "system") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Tema hook'u
 * 
 * Tema context'ine erişim sağlayan custom hook.
 * 
 * @returns ThemeContextType - Tema durumu ve fonksiyonları
 * @throws Error - ThemeProvider dışında kullanılırsa hata fırlatır
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};

export default ThemeContext; 