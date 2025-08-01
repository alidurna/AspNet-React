/**
 * useMemoryMonitor Hook
 * 
 * Memory usage tracking ve memory leak detection için hook.
 * JS Heap size, memory usage percentage ve memory trends'i takip eder.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Memory Info Interface
 */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsage: number; // Percentage
}

/**
 * Memory Trend Interface
 */
interface MemoryTrend {
  timestamp: number;
  usage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Memory Monitor Hook Return Type
 */
interface UseMemoryMonitorReturn {
  memoryInfo: MemoryInfo;
  memoryTrends: MemoryTrend[];
  isMonitoring: boolean;
  hasMemoryLeak: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearHistory: () => void;
}

/**
 * useMemoryMonitor Hook
 */
export const useMemoryMonitor = (
  monitoringInterval: number = 5000, // 5 seconds
  trendThreshold: number = 10 // MB
): UseMemoryMonitorReturn => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    memoryUsage: 0,
  });

  const [memoryTrends, setMemoryTrends] = useState<MemoryTrend[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasMemoryLeak, setHasMemoryLeak] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousUsageRef = useRef<number>(0);

  /**
   * Memory bilgilerini toplar
   */
  const collectMemoryInfo = useCallback((): MemoryInfo | null => {
    // Memory API desteği kontrol et
    if (!('memory' in performance)) {
      console.warn('Performance.memory API not supported');
      return null;
    }

    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    const totalMB = memory.totalJSHeapSize / (1024 * 1024);
    const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
    const usagePercentage = (usedMB / limitMB) * 100;

    return {
      usedJSHeapSize: Math.round(usedMB * 100) / 100, // MB
      totalJSHeapSize: Math.round(totalMB * 100) / 100, // MB
      jsHeapSizeLimit: Math.round(limitMB * 100) / 100, // MB
      memoryUsage: Math.round(usagePercentage * 100) / 100, // Percentage
    };
  }, []);

  /**
   * Memory trend'ini hesaplar
   */
  const calculateTrend = useCallback((currentUsage: number, previousUsage: number): 'increasing' | 'decreasing' | 'stable' => {
    const difference = currentUsage - previousUsage;
    
    if (Math.abs(difference) < trendThreshold) {
      return 'stable';
    }
    
    return difference > 0 ? 'increasing' : 'decreasing';
  }, [trendThreshold]);

  /**
   * Memory leak detection
   */
  const detectMemoryLeak = useCallback((trends: MemoryTrend[]): boolean => {
    if (trends.length < 5) return false;

    // Son 5 ölçümü kontrol et
    const recentTrends = trends.slice(-5);
    const increasingCount = recentTrends.filter(t => t.trend === 'increasing').length;
    
    // 5 ölçümün 4'ü increasing ise memory leak olabilir
    return increasingCount >= 4;
  }, []);

  /**
   * Memory monitoring'i başlatır
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    const monitor = () => {
      const currentMemory = collectMemoryInfo();
      
      if (currentMemory) {
        setMemoryInfo(currentMemory);
        
        const trend = calculateTrend(currentMemory.usedJSHeapSize, previousUsageRef.current);
        
        const newTrend: MemoryTrend = {
          timestamp: Date.now(),
          usage: currentMemory.usedJSHeapSize,
          trend,
        };

        setMemoryTrends(prev => {
          const updated = [...prev, newTrend];
          
          // Son 50 ölçümü sakla
          if (updated.length > 50) {
            updated.shift();
          }
          
          // Memory leak detection
          const leakDetected = detectMemoryLeak(updated);
          setHasMemoryLeak(leakDetected);
          
          return updated;
        });

        previousUsageRef.current = currentMemory.usedJSHeapSize;
      }
    };

    // İlk ölçüm
    monitor();
    
    // Interval başlat
    intervalRef.current = setInterval(monitor, monitoringInterval);
  }, [isMonitoring, collectMemoryInfo, calculateTrend, detectMemoryLeak, monitoringInterval]);

  /**
   * Memory monitoring'i durdurur
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMonitoring]);

  /**
   * Memory history'yi temizler
   */
  const clearHistory = useCallback(() => {
    setMemoryTrends([]);
    setHasMemoryLeak(false);
    previousUsageRef.current = 0;
  }, []);

  /**
   * Component unmount'ta monitoring'i durdur
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  /**
   * İlk memory bilgisini al
   */
  useEffect(() => {
    const initialMemory = collectMemoryInfo();
    if (initialMemory) {
      setMemoryInfo(initialMemory);
      previousUsageRef.current = initialMemory.usedJSHeapSize;
    }
  }, [collectMemoryInfo]);

  return {
    memoryInfo,
    memoryTrends,
    isMonitoring,
    hasMemoryLeak,
    startMonitoring,
    stopMonitoring,
    clearHistory,
  };
};

export default useMemoryMonitor; 