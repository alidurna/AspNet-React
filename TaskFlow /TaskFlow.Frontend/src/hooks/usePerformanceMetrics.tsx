/**
 * usePerformanceMetrics Custom Hook - Refactored
 *
 * Modüler performance hook'larını birleştiren ana hook.
 * Büyük monolitik yapı yerine küçük, focused hook'lar kullanır.
 */

import { useEffect, useCallback, useState } from 'react';
import { useWebVitals } from './performance/useWebVitals';
import { useMemoryMonitor } from './performance/useMemoryMonitor';

/**
 * Performance Metrics Interface - Simplified
 */
export interface PerformanceMetrics {
  // Web Vitals from sub-hook
  webVitals: ReturnType<typeof useWebVitals>['webVitals'];
  
  // Memory from sub-hook
  memory: ReturnType<typeof useMemoryMonitor>['memoryInfo'];
  
  // Navigation timing (basic)
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    firstByte: number;
  };
  
  // Overall performance score
  performanceScore: number;
  
  // Timestamp
  timestamp: number;
}

/**
 * Performance Config Interface
 */
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  reportInterval: number;
  thresholds: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

/**
 * Default configuration
 */
const defaultConfig: PerformanceConfig = {
  enabled: true,
  sampleRate: 1.0,
  reportInterval: 30000, // 30 seconds
  thresholds: {
    lcp: 2500, // ms
    fid: 100,  // ms
    cls: 0.1   // ratio
  }
};

/**
 * usePerformanceMetrics Hook - Refactored
 * 
 * Ana performance monitoring hook'u. Sub-hook'ları kullanarak
 * modüler yapı sağlar ve performans metriklerini toplar.
 */
export const usePerformanceMetrics = (config: Partial<PerformanceConfig> = {}) => {
  // ===== CONFIG =====
  const finalConfig = { ...defaultConfig, ...config };
  
  // ===== SUB-HOOKS =====
  const { webVitals, isLoading: webVitalsLoading } = useWebVitals();
  
  const { 
    memoryInfo, 
    isMonitoring: memoryMonitoring 
  } = useMemoryMonitor(5000);

  // ===== STATE =====
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== NAVIGATION TIMING =====
  const getNavigationTiming = useCallback((): PerformanceMetrics['navigation'] => {
    if (!window.performance?.timing) {
      return {
        domContentLoaded: 0,
        loadComplete: 0,
        firstByte: 0
      };
    }

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    return {
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      loadComplete: timing.loadEventEnd - navigationStart,
      firstByte: timing.responseStart - navigationStart
    };
  }, []);

  // ===== PERFORMANCE SCORE CALCULATION =====
  const calculatePerformanceScore = useCallback((webVitals: any): number => {
    if (!webVitals) return 0;

    let score = 100;
    const { lcp, fid, cls } = webVitals;

    // LCP scoring (0-40 points)
    if (lcp > finalConfig.thresholds.lcp) {
      score -= Math.min(40, (lcp - finalConfig.thresholds.lcp) / 100);
    }

    // FID scoring (0-30 points)
    if (fid > finalConfig.thresholds.fid) {
      score -= Math.min(30, (fid - finalConfig.thresholds.fid) / 10);
    }

    // CLS scoring (0-30 points)
    if (cls > finalConfig.thresholds.cls) {
      score -= Math.min(30, (cls - finalConfig.thresholds.cls) * 100);
    }

    return Math.max(0, Math.round(score));
  }, [finalConfig.thresholds]);

  // ===== METRICS COLLECTION =====
  const collectMetrics = useCallback((): PerformanceMetrics => {
    const navigation = getNavigationTiming();
    const performanceScore = calculatePerformanceScore(webVitals);

    return {
      webVitals: webVitals || {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        tti: 0,
        tbt: 0
      },
      memory: memoryInfo || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryUsage: 0
      },
      navigation,
      performanceScore,
      timestamp: Date.now()
    };
  }, [webVitals, memoryInfo, getNavigationTiming, calculatePerformanceScore]);

  // ===== EFFECTS =====
  /**
   * Initialize metrics collection
   */
  useEffect(() => {
    if (!finalConfig.enabled) {
      setIsLoading(false);
      return;
    }

    // Wait for sub-hooks to be ready
    if (webVitalsLoading || !memoryMonitoring) {
      return;
    }

    try {
      const initialMetrics = collectMetrics();
      setMetrics(initialMetrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Metrics collection failed');
    } finally {
      setIsLoading(false);
    }
  }, [
    finalConfig.enabled,
    webVitalsLoading,
    memoryMonitoring,
    collectMetrics
  ]);

  /**
   * Periodic metrics update
   */
  useEffect(() => {
    if (!finalConfig.enabled || isLoading) return;

    const interval = setInterval(() => {
      try {
        const updatedMetrics = collectMetrics();
        setMetrics(updatedMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Metrics update failed');
      }
    }, finalConfig.reportInterval);

    return () => clearInterval(interval);
  }, [finalConfig.enabled, finalConfig.reportInterval, isLoading, collectMetrics]);

  // ===== HELPER FUNCTIONS =====
  /**
   * Get performance grade based on score
   */
  const getPerformanceGrade = useCallback((score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, []);

  /**
   * Check if performance is good
   */
  const isPerformanceGood = useCallback((score: number): boolean => {
    return score >= 80;
  }, []);

  /**
   * Get performance recommendations
   */
  const getRecommendations = useCallback((): string[] => {
    if (!metrics) return [];

    const recommendations: string[] = [];
    const { webVitals, memory } = metrics;

    if (webVitals.lcp > finalConfig.thresholds.lcp) {
      recommendations.push('Optimize Largest Contentful Paint by reducing server response times');
    }

    if (webVitals.fid > finalConfig.thresholds.fid) {
      recommendations.push('Reduce First Input Delay by optimizing JavaScript execution');
    }

    if (webVitals.cls > finalConfig.thresholds.cls) {
      recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions');
    }

    if (memory.memoryUsage > 80) {
      recommendations.push('High memory usage detected - consider optimizing memory-intensive operations');
    }

    return recommendations;
  }, [metrics, finalConfig.thresholds]);

  // ===== RETURN =====
  return {
    // Core data
    metrics,
    isLoading,
    error,
    
    // Sub-hook data
    webVitals,
    memoryInfo,
    
    // Computed values
    performanceScore: metrics?.performanceScore || 0,
    performanceGrade: getPerformanceGrade(metrics?.performanceScore || 0),
    isPerformanceGood: isPerformanceGood(metrics?.performanceScore || 0),
    
    // Helper functions
    getRecommendations,
    collectMetrics,
    
    // Config
    config: finalConfig
  };
};

export default usePerformanceMetrics; 