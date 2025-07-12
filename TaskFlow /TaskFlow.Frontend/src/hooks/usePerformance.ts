/**
 * Performance Optimization Hooks
 *
 * Bu dosya, TaskFlow uygulamasının performans optimizasyonu için
 * kullanılan custom React hook'larını içerir. Memoization, throttling,
 * debouncing, performance monitoring ve virtual scrolling gibi
 * performans iyileştirme tekniklerini sağlar.
 *
 * Ana Özellikler:
 * - Debouncing ve throttling
 * - Memoization utilities
 * - Performance monitoring
 * - Virtual scrolling
 * - Resource preloading
 * - Memory monitoring
 *
 * Debouncing Hooks:
 * - useDebounce: Değer debouncing
 * - useDebouncedCallback: Callback debouncing
 * - Delay-based optimization
 * - Search input optimization
 * - API call optimization
 *
 * Throttling Hooks:
 * - useThrottle: Değer throttling
 * - useThrottledCallback: Callback throttling
 * - Rate limiting
 * - Scroll event optimization
 * - Resize event optimization
 *
 * Memoization Hooks:
 * - useMemoized: Expensive computation memoization
 * - Dependency-based caching
 * - Performance optimization
 * - Memory efficiency
 * - Re-render prevention
 *
 * Performance Monitoring:
 * - usePerformanceMonitor: Component render monitoring
 * - Render count tracking
 * - Render time measurement
 * - Performance logging
 * - Debug information
 *
 * Lazy Loading:
 * - useIntersectionObserver: Intersection Observer API
 * - Lazy loading support
 * - Infinite scrolling
 * - Image lazy loading
 * - Component lazy loading
 *
 * Virtual Scrolling:
 * - useVirtualScroll: Large list optimization
 * - Memory efficient rendering
 * - Smooth scrolling
 * - Performance optimization
 * - Large dataset handling
 *
 * Resource Management:
 * - useResourcePreloader: Resource preloading
 * - Image preloading
 * - Font preloading
 * - Script preloading
 * - Cache optimization
 *
 * Memory Monitoring:
 * - useMemoryMonitor: Memory usage tracking
 * - Performance metrics
 * - Memory leak detection
 * - Browser memory API
 * - Memory optimization
 *
 * Performance Optimization:
 * - Efficient re-renders
 * - Memory management
 * - Bundle optimization
 * - Loading optimization
 * - Cache strategies
 *
 * Error Handling:
 * - Graceful degradation
 * - Fallback mechanisms
 * - Error recovery
 * - Performance fallbacks
 * - Debug information
 *
 * Monitoring ve Analytics:
 * - Performance metrics
 * - User experience tracking
 * - Performance insights
 * - Optimization opportunities
 * - Performance trends
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler hook yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 * - Performance best practices
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useCallback, useMemo, useRef, useEffect, useState } from "react";

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Debounced callback hook
export const useDebouncedCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttled callback hook
export const useThrottledCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  limit: number
) => {
  const inThrottle = useRef<boolean>(false);

  const throttledCallback = useCallback(
    (...args: T) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );

  return throttledCallback;
};

// Memoized expensive computation hook
export const useMemoized = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = performance.now() - startTimeRef.current;

    if (renderCountRef.current > 1) {
      console.log(
        `🔍 ${componentName} render #${
          renderCountRef.current
        } took ${renderTime.toFixed(2)}ms`
      );
    }

    startTimeRef.current = performance.now();
  });

  return {
    renderCount: renderCountRef.current,
    logRender: (additionalInfo?: string) => {
      console.log(
        `📊 ${componentName} rendered ${renderCountRef.current} times${
          additionalInfo ? ` - ${additionalInfo}` : ""
        }`
      );
    },
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const [hasIntersected, setHasIntersected] = useState<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

// Virtual scrolling hook
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState<number>(0);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const totalItemCount = items.length;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, totalItemCount);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = totalItemCount * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
};

// Resource preloader hook
export const useResourcePreloader = () => {
  const [loadedResources, setLoadedResources] = useState<Set<string>>(
    new Set()
  );
  const [loadingResources, setLoadingResources] = useState<Set<string>>(
    new Set()
  );

  const preloadImage = useCallback(
    (src: string): Promise<void> => {
      if (loadedResources.has(src)) {
        return Promise.resolve();
      }

      if (loadingResources.has(src)) {
        return Promise.resolve(); // Already loading
      }

      setLoadingResources((prev) => new Set(prev).add(src));

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedResources((prev) => new Set(prev).add(src));
          setLoadingResources((prev) => {
            const newSet = new Set(prev);
            newSet.delete(src);
            return newSet;
          });
          resolve();
        };
        img.onerror = () => {
          setLoadingResources((prev) => {
            const newSet = new Set(prev);
            newSet.delete(src);
            return newSet;
          });
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
      });
    },
    [loadedResources, loadingResources]
  );

  const preloadScript = useCallback(
    (src: string): Promise<void> => {
      if (loadedResources.has(src)) {
        return Promise.resolve();
      }

      if (loadingResources.has(src)) {
        return Promise.resolve();
      }

      setLoadingResources((prev) => new Set(prev).add(src));

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          setLoadedResources((prev) => new Set(prev).add(src));
          setLoadingResources((prev) => {
            const newSet = new Set(prev);
            newSet.delete(src);
            return newSet;
          });
          resolve();
        };
        script.onerror = () => {
          setLoadingResources((prev) => {
            const newSet = new Set(prev);
            newSet.delete(src);
            return newSet;
          });
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
      });
    },
    [loadedResources, loadingResources]
  );

  return {
    preloadImage,
    preloadScript,
    isLoaded: (src: string) => loadedResources.has(src),
    isLoading: (src: string) => loadingResources.has(src),
    loadedCount: loadedResources.size,
    loadingCount: loadingResources.size,
  };
};

// Memory usage monitoring hook
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        const memory = (
          performance as {
            memory?: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;
        if (memory) {
          setMemoryInfo({
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          });
        }
      }
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return {
    ...memoryInfo,
    formattedUsed: formatBytes(memoryInfo.usedJSHeapSize),
    formattedTotal: formatBytes(memoryInfo.totalJSHeapSize),
    formattedLimit: formatBytes(memoryInfo.jsHeapSizeLimit),
    usagePercentage: memoryInfo.totalJSHeapSize
      ? Math.round(
          (memoryInfo.usedJSHeapSize! / memoryInfo.totalJSHeapSize) * 100
        )
      : 0,
  };
};

// Bundle for export
export const PerformanceHooks = {
  useDebounce,
  useThrottle,
  useDebouncedCallback,
  useThrottledCallback,
  useMemoized,
  usePerformanceMonitor,
  useIntersectionObserver,
  useVirtualScroll,
  useResourcePreloader,
  useMemoryMonitor,
};

export default PerformanceHooks;
