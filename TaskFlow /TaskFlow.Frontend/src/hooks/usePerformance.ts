/**
 * Performance Hooks - Main Export
 * 
 * Modüler performance hooks'ların ana export dosyası.
 * Eski usePerformance.ts'in yerini alan refactored yapı.
 */

// Re-export all debouncing hooks
export {
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
} from './performance/useDebouncing';

// Re-export all throttling hooks
export {
  useThrottle,
  useThrottledCallback,
  useScrollThrottle,
  useResizeThrottle,
} from './performance/useThrottling';

// Re-export all memoization hooks
export {
  useMemoized,
  useMemoizedCallback,
  useDeepMemo,
  useMemoizedSelector,
  useStableMemo,
  useComputedValue,
} from './performance/useMemoization';

// Re-export all virtualization hooks
export {
  useVirtualScroll,
  useIntersectionObserver,
  useInfiniteScroll,
} from './performance/useVirtualization';

// Main performance orchestrator hook
import { useCallback, useMemo } from 'react';
import { useDebounce, useDebouncedCallback } from './performance/useDebouncing';
import { useThrottle, useThrottledCallback } from './performance/useThrottling';
import { useMemoized } from './performance/useMemoization';

/**
 * usePerformanceOptimizer - Ana performans optimizasyon hook'u
 * 
 * Tüm performans optimizasyon tekniklerini bir arada sunan orchestrator hook.
 * Kolay kullanım için tek bir interface sağlar.
 * 
 * @param options - Performans optimizasyon seçenekleri
 * @returns Performans optimizasyon utilities
 */
export const usePerformanceOptimizer = (options: {
  debounceDelay?: number;
  throttleLimit?: number;
  enableMemoization?: boolean;
} = {}) => {
  const {
    debounceDelay = 300,
    throttleLimit = 100,
    enableMemoization = true,
  } = options;

  // Debouncing utilities
  const createDebouncedValue = useCallback(
    <T>(value: T, customDelay?: number) => 
      useDebounce(value, customDelay || debounceDelay),
    [debounceDelay]
  );

  const createDebouncedCallback = useCallback(
    <T extends unknown[]>(callback: (...args: T) => void, customDelay?: number) =>
      useDebouncedCallback(callback, customDelay || debounceDelay),
    [debounceDelay]
  );

  // Throttling utilities
  const createThrottledValue = useCallback(
    <T>(value: T, customLimit?: number) =>
      useThrottle(value, customLimit || throttleLimit),
    [throttleLimit]
  );

  const createThrottledCallback = useCallback(
    <T extends unknown[]>(callback: (...args: T) => void, customLimit?: number) =>
      useThrottledCallback(callback, customLimit || throttleLimit),
    [throttleLimit]
  );

  // Memoization utilities
  const memoizeComputation = useCallback(
    <T>(computeFn: () => T, dependencies: React.DependencyList) => {
      if (!enableMemoization) return computeFn();
      return useMemoized(computeFn, dependencies);
    },
    [enableMemoization]
  );

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    debounceDelay,
    throttleLimit,
    memoizationEnabled: enableMemoization,
    optimizationLevel: enableMemoization ? 'high' : 'medium',
  }), [debounceDelay, throttleLimit, enableMemoization]);

  return {
    // Debouncing
    createDebouncedValue,
    createDebouncedCallback,
    
    // Throttling
    createThrottledValue,
    createThrottledCallback,
    
    // Memoization
    memoizeComputation,
    
    // Metrics
    performanceMetrics,
  };
};

// Default export for easier imports
export default {
  // Debouncing
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
  
  // Throttling
  useThrottle,
  useThrottledCallback,
  useScrollThrottle,
  useResizeThrottle,
  
  // Memoization
  useMemoized,
  useMemoizedCallback,
  useDeepMemo,
  useMemoizedSelector,
  useStableMemo,
  useComputedValue,
  
  // Virtualization
  useVirtualScroll,
  useIntersectionObserver,
  useInfiniteScroll,
  
  // Main optimizer
  usePerformanceOptimizer,
};
