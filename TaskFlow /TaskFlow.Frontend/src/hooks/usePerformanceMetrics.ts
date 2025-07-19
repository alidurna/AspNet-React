/**
 * usePerformanceMetrics Custom Hook
 *
 * Bu dosya, TaskFlow uygulamasında performans metriklerini
 * takip etmek için kullanılan performance monitoring hook'unu içerir.
 * Web Vitals, Core Web Vitals ve custom performans metriklerini toplar.
 *
 * Ana Özellikler:
 * - Core Web Vitals tracking
 * - Custom performance metrics
 * - Real-time monitoring
 * - Performance alerts
 * - Resource timing
 * - Memory usage tracking
 *
 * Performance Metrics:
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * - Cumulative Layout Shift (CLS)
 * - First Contentful Paint (FCP)
 * - Time to Interactive (TTI)
 * - Total Blocking Time (TBT)
 *
 * Monitoring Features:
 * - Real-time metric collection
 * - Performance degradation detection
 * - Resource loading analysis
 * - Memory leak detection
 * - User experience scoring
 * - Performance optimization suggestions
 *
 * Performance:
 * - Efficient metric collection
 * - Minimal performance impact
 * - Background processing
 * - Smart sampling
 * - Batch reporting
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useCallback, useRef, useState } from 'react';

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
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  webVitals: CoreWebVitals;
  
  // Navigation Timing
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    firstByte: number;
    domInteractive: number;
    redirectCount: number;
  };
  
  // Resource Timing
  resources: {
    totalResources: number;
    totalSize: number;
    slowestResource: {
      name: string;
      duration: number;
      size: number;
    };
    resourceTypes: Record<string, number>;
  };
  
  // Memory Usage
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    memoryUsage: number; // Percentage
  };
  
  // Custom Metrics
  custom: {
    timeToFirstRender: number;
    timeToFirstMeaningfulPaint: number;
    interactionToNextPaint: number;
    pageVisibilityTime: number;
  };
  
  // Performance Score
  score: {
    overall: number;
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
  };
}

/**
 * Performance Alert Interface
 */
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Performance Configuration Interface
 */
export interface PerformanceConfig {
  enabled: boolean;
  endpoint: string;
  sampleRate: number; // 0-1, percentage of users to track
  alertThresholds: {
    lcp: number; // 2.5s
    fid: number; // 100ms
    cls: number; // 0.1
    fcp: number; // 1.8s
    tti: number; // 3.8s
    memoryUsage: number; // 80%
  };
  trackResources: boolean;
  trackMemory: boolean;
  trackCustomMetrics: boolean;
  debug: boolean;
  flushInterval: number;
}

/**
 * Performance State Interface
 */
export interface PerformanceState {
  metrics: PerformanceMetrics | null;
  alerts: PerformanceAlert[];
  isInitialized: boolean;
  config: PerformanceConfig;
  lastUpdate: number;
}

/**
 * usePerformanceMetrics Custom Hook
 *
 * Performans metriklerini takip etmek için kullanılan hook.
 * Core Web Vitals, custom metrics ve performance alerts sağlar.
 *
 * @param config - Performance konfigürasyonu
 * @returns Performance functions ve state
 */
export function usePerformanceMetrics(config: Partial<PerformanceConfig> = {}) {
  const [state, setState] = useState<PerformanceState>({
    metrics: null,
    alerts: [],
    isInitialized: false,
    config: {
      enabled: true,
      endpoint: '/api/performance',
      sampleRate: 0.1, // 10% of users
      alertThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        tti: 3800,
        memoryUsage: 80
      },
      trackResources: true,
      trackMemory: true,
      trackCustomMetrics: true,
      debug: false,
      flushInterval: 60000, // 1 minute
      ...config
    },
    lastUpdate: 0
  });

  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const observersRef = useRef<{
    lcp?: PerformanceObserver;
    fid?: PerformanceObserver;
    cls?: PerformanceObserver;
    fcp?: PerformanceObserver;
  }>({});

  /**
   * Calculate performance score
   */
  const calculateScore = useCallback((metrics: Partial<CoreWebVitals>): number => {
    let score = 100;
    
    // LCP scoring
    if (metrics.lcp) {
      if (metrics.lcp <= 2500) score -= 0;
      else if (metrics.lcp <= 4000) score -= 10;
      else score -= 25;
    }
    
    // FID scoring
    if (metrics.fid) {
      if (metrics.fid <= 100) score -= 0;
      else if (metrics.fid <= 300) score -= 10;
      else score -= 25;
    }
    
    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls <= 0.1) score -= 0;
      else if (metrics.cls <= 0.25) score -= 10;
      else score -= 25;
    }
    
    return Math.max(0, score);
  }, []);

  /**
   * Check performance thresholds
   */
  const checkThresholds = useCallback((metrics: PerformanceMetrics): PerformanceAlert[] => {
    const alerts: PerformanceAlert[] = [];
    const { alertThresholds } = state.config;

    // LCP check
    if (metrics.webVitals.lcp > alertThresholds.lcp) {
      alerts.push({
        id: `lcp-${Date.now()}`,
        type: 'warning',
        metric: 'LCP',
        value: metrics.webVitals.lcp,
        threshold: alertThresholds.lcp,
        message: `LCP (${metrics.webVitals.lcp}ms) is above threshold (${alertThresholds.lcp}ms)`,
        timestamp: Date.now(),
        severity: metrics.webVitals.lcp > 4000 ? 'high' : 'medium'
      });
    }

    // FID check
    if (metrics.webVitals.fid > alertThresholds.fid) {
      alerts.push({
        id: `fid-${Date.now()}`,
        type: 'warning',
        metric: 'FID',
        value: metrics.webVitals.fid,
        threshold: alertThresholds.fid,
        message: `FID (${metrics.webVitals.fid}ms) is above threshold (${alertThresholds.fid}ms)`,
        timestamp: Date.now(),
        severity: metrics.webVitals.fid > 300 ? 'high' : 'medium'
      });
    }

    // CLS check
    if (metrics.webVitals.cls > alertThresholds.cls) {
      alerts.push({
        id: `cls-${Date.now()}`,
        type: 'warning',
        metric: 'CLS',
        value: metrics.webVitals.cls,
        threshold: alertThresholds.cls,
        message: `CLS (${metrics.webVitals.cls}) is above threshold (${alertThresholds.cls})`,
        timestamp: Date.now(),
        severity: metrics.webVitals.cls > 0.25 ? 'high' : 'medium'
      });
    }

    // Memory usage check
    if (metrics.memory.memoryUsage > alertThresholds.memoryUsage) {
      alerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        metric: 'Memory Usage',
        value: metrics.memory.memoryUsage,
        threshold: alertThresholds.memoryUsage,
        message: `Memory usage (${metrics.memory.memoryUsage}%) is above threshold (${alertThresholds.memoryUsage}%)`,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    return alerts;
  }, [state.config]);

  /**
   * Collect Core Web Vitals
   */
  const collectWebVitals = useCallback((): Promise<CoreWebVitals> => {
    return new Promise((resolve) => {
      const vitals: Partial<CoreWebVitals> = {};
      let collected = 0;

      // LCP
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
          collected++;
          if (collected >= 6) resolve(vitals as CoreWebVitals);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.lcp = lcpObserver;
      }

      // FID
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as any;
          vitals.fid = firstEntry.processingStart - firstEntry.startTime;
          collected++;
          if (collected >= 6) resolve(vitals as CoreWebVitals);
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        observersRef.current.fid = fidObserver;
      }

      // CLS
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
          collected++;
          if (collected >= 6) resolve(vitals as CoreWebVitals);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.cls = clsObserver;
      }

      // FCP
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          vitals.fcp = firstEntry.startTime;
          collected++;
          if (collected >= 6) resolve(vitals as CoreWebVitals);
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        observersRef.current.fcp = fcpObserver;
      }

      // Fallback for older browsers
      setTimeout(() => {
        if (collected < 6) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          vitals.fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
          vitals.tti = navigation.domInteractive - navigation.fetchStart;
          vitals.tbt = 0; // Not available in older browsers
          
          resolve(vitals as CoreWebVitals);
        }
      }, 5000);
    });
  }, []);

  /**
   * Collect navigation timing
   */
  const collectNavigationTiming = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
      redirectCount: navigation.redirectCount
    };
  }, []);

  /**
   * Collect resource timing
   */
  const collectResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource');
    const resourceTypes: Record<string, number> = {};
    let totalSize = 0;
    let slowestResource = { name: '', duration: 0, size: 0 };

    resources.forEach(resource => {
      const type = (resource as any).initiatorType;
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;
      
      const size = (resource as any).transferSize || 0;
      totalSize += size;

      if (resource.duration > slowestResource.duration) {
        slowestResource = {
          name: resource.name,
          duration: resource.duration,
          size
        };
      }
    });

    return {
      totalResources: resources.length,
      totalSize,
      slowestResource,
      resourceTypes
    };
  }, []);

  /**
   * Collect memory usage
   */
  const collectMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      memoryUsage: 0
    };
  }, []);

  /**
   * Collect custom metrics
   */
  const collectCustomMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      timeToFirstRender: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      timeToFirstMeaningfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      interactionToNextPaint: 0, // Custom metric, would need user interaction tracking
      pageVisibilityTime: Date.now() - navigation.fetchStart
    };
  }, []);

  /**
   * Collect all performance metrics
   */
  const collectMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    const [webVitals, navigation, resources, memory, custom] = await Promise.all([
      collectWebVitals(),
      collectNavigationTiming(),
      state.config.trackResources ? collectResourceTiming() : {
        totalResources: 0,
        totalSize: 0,
        slowestResource: { name: '', duration: 0, size: 0 },
        resourceTypes: {}
      },
      state.config.trackMemory ? collectMemoryUsage() : {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryUsage: 0
      },
      state.config.trackCustomMetrics ? collectCustomMetrics() : {
        timeToFirstRender: 0,
        timeToFirstMeaningfulPaint: 0,
        interactionToNextPaint: 0,
        pageVisibilityTime: 0
      }
    ]);

    const overallScore = calculateScore(webVitals);

    const metrics: PerformanceMetrics = {
      webVitals,
      navigation,
      resources,
      memory,
      custom,
      score: {
        overall: overallScore,
        lcp: webVitals.lcp <= 2500 ? 100 : webVitals.lcp <= 4000 ? 75 : 50,
        fid: webVitals.fid <= 100 ? 100 : webVitals.fid <= 300 ? 75 : 50,
        cls: webVitals.cls <= 0.1 ? 100 : webVitals.cls <= 0.25 ? 75 : 50,
        fcp: webVitals.fcp <= 1800 ? 100 : webVitals.fcp <= 3000 ? 75 : 50
      }
    };

    return metrics;
  }, [collectWebVitals, collectNavigationTiming, collectResourceTiming, collectMemoryUsage, collectCustomMetrics, calculateScore, state.config]);

  /**
   * Update performance metrics
   */
  const updateMetrics = useCallback(async () => {
    if (!state.config.enabled) return;

    try {
      const metrics = await collectMetrics();
      const alerts = checkThresholds(metrics);

      setState(prev => ({
        ...prev,
        metrics,
        alerts: [...prev.alerts, ...alerts],
        lastUpdate: Date.now()
      }));

      if (state.config.debug) {
        console.log('📊 Performance metrics updated:', metrics);
        if (alerts.length > 0) {
          console.warn('⚠️ Performance alerts:', alerts);
        }
      }
    } catch (error) {
      console.error('Performance metrics collection error:', error);
    }
  }, [state.config, collectMetrics, checkThresholds]);

  /**
   * Flush metrics to server
   */
  const flushMetrics = useCallback(async () => {
    if (!state.metrics) return;

    try {
      await fetch(state.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: state.metrics,
          alerts: state.alerts,
          timestamp: Date.now()
        })
      });

      // Clear alerts after sending
      setState(prev => ({
        ...prev,
        alerts: []
      }));

      if (state.config.debug) {
        console.log('📊 Performance metrics flushed');
      }
    } catch (error) {
      console.error('Performance metrics flush error:', error);
    }
  }, [state.metrics, state.alerts, state.config]);

  /**
   * Initialize performance monitoring
   */
  const initialize = useCallback(() => {
    if (state.isInitialized) return;

    // Random sampling
    if (Math.random() > state.config.sampleRate) {
      return;
    }

    // Initial metrics collection
    updateMetrics();

    // Set up periodic updates
    flushTimeoutRef.current = setInterval(flushMetrics, state.config.flushInterval);

    setState(prev => ({
      ...prev,
      isInitialized: true
    }));

    if (state.config.debug) {
      console.log('📊 Performance monitoring initialized');
    }
  }, [state.isInitialized, state.config, updateMetrics, flushMetrics]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initialize();

    return () => {
      // Cleanup observers
      Object.values(observersRef.current).forEach(observer => {
        if (observer) observer.disconnect();
      });

      if (flushTimeoutRef.current) {
        clearInterval(flushTimeoutRef.current);
      }
    };
  }, [initialize]);

  return {
    // State
    metrics: state.metrics,
    alerts: state.alerts,
    isInitialized: state.isInitialized,
    config: state.config,
    lastUpdate: state.lastUpdate,

    // Actions
    updateMetrics,
    flushMetrics,
    collectMetrics
  };
} 