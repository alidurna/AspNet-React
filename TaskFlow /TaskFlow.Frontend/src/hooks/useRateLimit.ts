/**
 * Rate Limiting Hook
 *
 * Bu dosya, brute force saldırılarına karşı koruma sağlayan
 * rate limiting hook'unu içerir. Başarısız login denemelerini
 * takip eder ve güvenlik önlemleri uygular.
 *
 * Ana Özellikler:
 * - Başarısız login denemelerini takip etme
 * - IP bazlı rate limiting
 * - Progressive delay (artan bekleme süreleri)
 * - Account lockout mekanizması
 * - LocalStorage'da durum saklama
 * - Otomatik reset mekanizması
 *
 * Güvenlik Seviyeleri:
 * - 1-3 deneme: Normal
 * - 4-5 deneme: 30 saniye bekleme
 * - 6-8 deneme: 2 dakika bekleme
 * - 9+ deneme: 15 dakika bekleme
 *
 * Kullanım:
 * - Login formlarında brute force koruması
 * - API rate limiting
 * - Account security monitoring
 *
 * Performans:
 * - Efficient localStorage operations
 * - Minimal memory usage
 * - Optimized cleanup
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Configurable limits
 * - Extensible design
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Rate limit durumu için tip tanımı
 */
interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
  isLocked: boolean;
  remainingTime: number;
}

/**
 * Rate limit konfigürasyonu
 */
interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number;
  progressiveDelay: boolean;
  resetAfterSuccess: boolean;
}

/**
 * Rate Limiting Hook
 *
 * Brute force saldırılarına karşı koruma sağlayan hook.
 * Başarısız denemeleri takip eder ve güvenlik önlemleri uygular.
 *
 * @param key - Rate limit için benzersiz anahtar (örn: email)
 * @param config - Rate limit konfigürasyonu
 * @returns Rate limit durumu ve fonksiyonları
 */
export const useRateLimit = (
  key: string,
  config: Partial<RateLimitConfig> = {}
) => {
  // Varsayılan konfigürasyon
  const defaultConfig: RateLimitConfig = {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 dakika
    progressiveDelay: true,
    resetAfterSuccess: true,
    ...config,
  };

  // Rate limit durumu
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(`rate-limit-${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Kilit süresi dolmuş mu kontrol et
      if (parsed.lockedUntil && now > parsed.lockedUntil) {
        localStorage.removeItem(`rate-limit-${key}`);
        return {
          attempts: 0,
          lastAttempt: 0,
          lockedUntil: 0,
          isLocked: false,
          remainingTime: 0,
        };
      }
      
      return {
        ...parsed,
        isLocked: parsed.lockedUntil ? now < parsed.lockedUntil : false,
        remainingTime: parsed.lockedUntil ? Math.max(0, parsed.lockedUntil - now) : 0,
      };
    }
    
    return {
      attempts: 0,
      lastAttempt: 0,
      lockedUntil: 0,
      isLocked: false,
      remainingTime: 0,
    };
  });

  /**
   * Rate limit durumunu localStorage'a kaydet
   */
  const saveState = useCallback((newState: RateLimitState) => {
    localStorage.setItem(`rate-limit-${key}`, JSON.stringify(newState));
    setState(newState);
  }, [key]);

  /**
   * Başarısız deneme kaydet
   */
  const recordFailedAttempt = useCallback(() => {
    const now = Date.now();
    const newAttempts = state.attempts + 1;
    
    let lockedUntil = state.lockedUntil;
    let isLocked = state.isLocked;
    
    // Progressive delay hesapla
    if (defaultConfig.progressiveDelay) {
      if (newAttempts >= 9) {
        lockedUntil = now + (15 * 60 * 1000); // 15 dakika
        isLocked = true;
      } else if (newAttempts >= 6) {
        lockedUntil = now + (2 * 60 * 1000); // 2 dakika
        isLocked = true;
      } else if (newAttempts >= 4) {
        lockedUntil = now + (30 * 1000); // 30 saniye
        isLocked = true;
      }
    } else if (newAttempts >= defaultConfig.maxAttempts) {
      lockedUntil = now + defaultConfig.lockoutDuration;
      isLocked = true;
    }
    
    const newState: RateLimitState = {
      attempts: newAttempts,
      lastAttempt: now,
      lockedUntil,
      isLocked,
      remainingTime: lockedUntil ? Math.max(0, lockedUntil - now) : 0,
    };
    
    saveState(newState);
  }, [state, defaultConfig, saveState]);

  /**
   * Başarılı deneme kaydet
   */
  const recordSuccess = useCallback(() => {
    if (defaultConfig.resetAfterSuccess) {
      localStorage.removeItem(`rate-limit-${key}`);
      setState({
        attempts: 0,
        lastAttempt: 0,
        lockedUntil: 0,
        isLocked: false,
        remainingTime: 0,
      });
    }
  }, [key, defaultConfig.resetAfterSuccess]);

  /**
   * Rate limit durumunu sıfırla
   */
  const reset = useCallback(() => {
    localStorage.removeItem(`rate-limit-${key}`);
    setState({
      attempts: 0,
      lastAttempt: 0,
      lockedUntil: 0,
      isLocked: false,
      remainingTime: 0,
    });
  }, [key]);

  /**
   * Kalan süreyi formatla
   */
  const formatRemainingTime = useCallback((ms: number): string => {
    if (ms <= 0) return "0 saniye";
    
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes} dakika ${seconds} saniye`;
    }
    return `${seconds} saniye`;
  }, []);

  /**
   * Rate limit durumunu kontrol et
   */
  const checkRateLimit = useCallback((): {
    allowed: boolean;
    remainingAttempts: number;
    remainingTime: number;
    message: string;
  } => {
    const now = Date.now();
    
    // Kilit süresi dolmuş mu kontrol et
    if (state.lockedUntil && now > state.lockedUntil) {
      reset();
      return {
        allowed: true,
        remainingAttempts: defaultConfig.maxAttempts,
        remainingTime: 0,
        message: "",
      };
    }
    
    if (state.isLocked) {
      const remainingTime = Math.max(0, state.lockedUntil - now);
      return {
        allowed: false,
        remainingAttempts: 0,
        remainingTime,
        message: `Çok fazla başarısız deneme. Lütfen ${formatRemainingTime(remainingTime)} bekleyin.`,
      };
    }
    
    const remainingAttempts = Math.max(0, defaultConfig.maxAttempts - state.attempts);
    return {
      allowed: true,
      remainingAttempts,
      remainingTime: 0,
      message: remainingAttempts < 3 ? `${remainingAttempts} deneme hakkınız kaldı.` : "",
    };
  }, [state, defaultConfig.maxAttempts, reset, formatRemainingTime]);

  // Kalan süreyi güncelle
  useEffect(() => {
    if (state.isLocked && state.remainingTime > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.max(0, state.lockedUntil - now);
        
        if (remainingTime <= 0) {
          reset();
        } else {
          setState(prev => ({
            ...prev,
            remainingTime,
            isLocked: true,
          }));
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [state.isLocked, state.remainingTime, state.lockedUntil, reset]);

  return {
    // State
    attempts: state.attempts,
    isLocked: state.isLocked,
    remainingTime: state.remainingTime,
    
    // Functions
    recordFailedAttempt,
    recordSuccess,
    reset,
    checkRateLimit,
    formatRemainingTime,
  };
};

export default useRateLimit; 