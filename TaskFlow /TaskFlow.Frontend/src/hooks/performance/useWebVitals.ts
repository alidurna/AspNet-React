/**
 * useWebVitals Hook
 * 
 * Core Web Vitals metriklerini takip eden hook.
 * LCP, FID, CLS, FCP, TTI ve TBT metriklerini toplar.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Core Web Vitals Interface
 */
export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
}

/**
 * Web Vitals Hook Return Type
 */
interface UseWebVitalsReturn {
  webVitals: CoreWebVitals;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * useWebVitals Hook
 */
export const useWebVitals = (): UseWebVitalsReturn => {
  const [webVitals, setWebVitals] = useState<CoreWebVitals>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    tti: 0,
    tbt: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Performance Observer ile metrikleri toplar
   */
  const collectWebVitals = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      // Performance Observer desteği kontrol et
      if (!('PerformanceObserver' in window)) {
        throw new Error('PerformanceObserver not supported');
      }

      const vitals: Partial<CoreWebVitals> = {};

      // LCP (Largest Contentful Paint) Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        vitals.lcp = lastEntry.startTime;
        updateVitals(vitals);
      });

      // FCP (First Contentful Paint) Observer
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
            updateVitals(vitals);
          }
        }
      });

      // CLS (Cumulative Layout Shift) Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.cls = clsValue;
        updateVitals(vitals);
      });

      // FID (First Input Delay) Observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          vitals.fid = entry.processingStart - entry.startTime;
          updateVitals(vitals);
        }
      });

      // Observer'ları başlat
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observer failed:', e);
      }

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer failed:', e);
      }

      // Navigation Timing'den temel metrikleri al
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        // TTI ve TBT hesaplamaları (basitleştirilmiş)
        vitals.tti = navigation.domInteractive;
        vitals.tbt = Math.max(0, navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        updateVitals(vitals);
      }

      // Cleanup function
      const cleanup = () => {
        lcpObserver.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };

      // 10 saniye sonra observer'ları kapat
      setTimeout(() => {
        cleanup();
        setIsLoading(false);
      }, 10000);

      return cleanup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Web Vitals collection failed');
      setIsLoading(false);
    }
  }, []);

  /**
   * Vitals'ı günceller
   */
  const updateVitals = useCallback((newVitals: Partial<CoreWebVitals>) => {
    setWebVitals(prev => ({ ...prev, ...newVitals }));
  }, []);

  /**
   * Refresh function
   */
  const refresh = useCallback(() => {
    collectWebVitals();
  }, [collectWebVitals]);

  /**
   * Component mount'ta metrikleri topla
   */
  useEffect(() => {
    const cleanup = collectWebVitals();
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [collectWebVitals]);

  return {
    webVitals,
    isLoading,
    error,
    refresh,
  };
};

export default useWebVitals; 