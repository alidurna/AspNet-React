/**
 * Performance Monitoring Service - TaskFlow
 *
 * Web Vitals ve custom performance metrics'leri takip etmek için
 * kullanılan service. Real-time performance data collection ve
 * analytics integration sağlar.
 */

// Web Vitals import removed - can be added later when web-vitals package is available

/**
 * Performance metric interface
 */
interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  enabled: boolean;
  debug: boolean;
  sampleRate: number; // 0-1 arası, hangi oranla data topla
  endpoint?: string; // Analytics endpoint
  apiKey?: string; // API anahtarı
}

/**
 * Performance Monitoring Service
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private isInitialized = false;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    if (Math.random() > this.config.sampleRate) {
      // Sample rate kontrolü - rastgele kullanıcıları monitör et
      return;
    }

    this.isInitialized = true;
    this.setupCustomMetrics();
    this.setupErrorTracking();

    if (this.config.debug) {
      console.log("🚀 Performance monitoring initialized");
    }
  }

  /**
   * Setup custom performance metrics
   */
  private setupCustomMetrics() {
    // Route change tracking
    this.trackRouteChanges();

    // Memory usage tracking
    this.trackMemoryUsage();
  }

  /**
   * Track route changes
   */
  private trackRouteChanges() {
    let lastPath = window.location.pathname;
    let navigationStart = performance.now();

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        const navigationTime = performance.now() - navigationStart;

        this.trackCustomMetric("Route Change", navigationTime, {
          from: lastPath,
          to: currentPath,
        });

        lastPath = currentPath;
        navigationStart = performance.now();
      }
    };

    // React Router navigation tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleRouteChange();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleRouteChange();
      return result;
    };

    window.addEventListener("popstate", handleRouteChange);
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage() {
    if ("memory" in performance) {
      const memoryInfo = (performance as any).memory;

      setInterval(() => {
        this.trackCustomMetric("Memory Usage", memoryInfo.usedJSHeapSize, {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
        });
      }, 30000); // Her 30 saniyede bir
    }
  }

  /**
   * Track custom metrics
   */
  private trackCustomMetric(name: string, value: number, metadata: any = {}) {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: this.getRating(name, value),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);

    if (this.config.debug) {
      console.log(`📈 ${name}:`, metric, metadata);
    }
  }

  /**
   * Get performance rating
   */
  private getRating(
    name: string,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    // Custom rating logic for different metrics
    switch (name) {
      case "Route Change":
        return value < 100
          ? "good"
          : value < 300
          ? "needs-improvement"
          : "poor";
      case "Memory Usage":
        return value < 50000000
          ? "good"
          : value < 100000000
          ? "needs-improvement"
          : "poor";
      default:
        return "good";
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking() {
    // JavaScript errors
    window.addEventListener("error", (event) => {
      this.trackCustomMetric("JavaScript Error", 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.trackCustomMetric("Promise Rejection", 1, {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Create performance report
   */
  async createReport() {
    const customMetrics = this.getMetrics();

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      customMetrics,
      summary: {
        totalMetrics: customMetrics.length,
        errors: customMetrics.filter((m) => m.name.includes("Error")).length,
        routeChanges: customMetrics.filter((m) => m.name === "Route Change")
          .length,
        averageRouteChangeTime: this.calculateAverage(
          customMetrics
            .filter((m) => m.name === "Route Change")
            .map((m) => m.value)
        ),
      },
    };
  }

  /**
   * Calculate average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  enabled: true,
  debug: true, // Development modunda debug aktif
  sampleRate: 1.0, // Development'da %100 sampling
};

// Global instance
export const performanceMonitor = new PerformanceMonitor(defaultConfig);

// Auto-initialize
performanceMonitor.init();

// Export utilities
export type { PerformanceMetric, PerformanceConfig };
