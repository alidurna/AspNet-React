/**
 * Session Performance Optimization Hook
 * 
 * Session'ların performansını optimize eder
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { PomodoroSession } from '../../../services/api/pomodoroAPI';

interface UseSessionOptimizationOptions {
  enableMemoization?: boolean;
  enableDebouncing?: boolean;
  enableVirtualization?: boolean;
  cacheSize?: number;
  debounceDelay?: number;
}

interface SessionCache {
  [key: string]: {
    data: PomodoroSession;
    timestamp: number;
    accessCount: number;
  };
}

/**
 * Session Performance Optimization Hook
 */
export const useSessionOptimization = (
  sessions: PomodoroSession[],
  options: UseSessionOptimizationOptions = {}
) => {
  const {
    enableMemoization = true,
    enableDebouncing = true,
    enableVirtualization = false,
    cacheSize = 100,
    debounceDelay = 300
  } = options;

  // Cache state
  const [sessionCache, setSessionCache] = useState<SessionCache>({});
  const [cacheHits, setCacheHits] = useState<number>(0);
  const [cacheMisses, setCacheMisses] = useState<number>(0);

  // Debouncing state
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSessions, setDebouncedSessions] = useState<PomodoroSession[]>(sessions);

  // Virtualization state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [itemHeight, setItemHeight] = useState<number>(80);

  /**
   * Session'ları cache'e ekler
   */
  const cacheSession = useCallback((session: PomodoroSession) => {
    const key = `session_${session.id}`;
    const now = Date.now();
    
    setSessionCache(prev => {
      const newCache = { ...prev };
      
      // Cache size kontrolü
      const cacheKeys = Object.keys(newCache);
      if (cacheKeys.length >= cacheSize) {
        // LRU: En eski ve en az kullanılan entry'yi sil
        const oldestKey = cacheKeys.reduce((oldest, current) => {
          const oldestEntry = newCache[oldest];
          const currentEntry = newCache[current];
          
          if (oldestEntry.accessCount < currentEntry.accessCount) {
            return oldest;
          }
          if (oldestEntry.accessCount === currentEntry.accessCount && 
              oldestEntry.timestamp < currentEntry.timestamp) {
            return oldest;
          }
          return current;
        });
        
        delete newCache[oldestKey];
      }
      
      newCache[key] = {
        data: session,
        timestamp: now,
        accessCount: (newCache[key]?.accessCount || 0) + 1
      };
      
      return newCache;
    });
  }, [cacheSize]);

  /**
   * Session'ı cache'den alır
   */
  const getCachedSession = useCallback((sessionId: number): PomodoroSession | null => {
    const key = `session_${sessionId}`;
    const cached = sessionCache[key];
    
    if (cached) {
      setCacheHits(prev => prev + 1);
      // Access count'u artır
      setSessionCache(prev => ({
        ...prev,
        [key]: { ...cached, accessCount: cached.accessCount + 1 }
      }));
      return cached.data;
    }
    
    setCacheMisses(prev => prev + 1);
    return null;
  }, [sessionCache]);

  /**
   * Memoized session filtreleme
   */
  const filteredSessions = useMemo(() => {
    if (!enableMemoization) return sessions;
    
    return sessions.map(session => {
      // Cache'den kontrol et
      const cached = getCachedSession(session.id!);
      if (cached) {
        return cached;
      }
      
      // Cache'e ekle
      cacheSession(session);
      return session;
    });
  }, [sessions, enableMemoization, getCachedSession, cacheSession]);

  /**
   * Debounced session güncellemesi
   */
  useEffect(() => {
    if (!enableDebouncing) {
      setDebouncedSessions(sessions);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSessions(sessions);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sessions, enableDebouncing, debounceDelay]);

  /**
   * Virtualized session listesi
   */
  const virtualizedSessions = useMemo(() => {
    if (!enableVirtualization) return debouncedSessions;
    
    return debouncedSessions.slice(visibleRange.start, visibleRange.end);
  }, [debouncedSessions, visibleRange, enableVirtualization]);

  /**
   * Session'ları state'e göre grupla
   */
  const groupedSessions = useMemo(() => {
    const groups = {
      active: [] as PomodoroSession[],
      paused: [] as PomodoroSession[],
      completed: [] as PomodoroSession[],
      cancelled: [] as PomodoroSession[],
      other: [] as PomodoroSession[]
    };

    debouncedSessions.forEach(session => {
      switch (session.state) {
        case 'active':
          groups.active.push(session);
          break;
        case 'paused':
          groups.paused.push(session);
          break;
        case 'completed':
          groups.completed.push(session);
          break;
        case 'cancelled':
          groups.cancelled.push(session);
          break;
        default:
          groups.other.push(session);
      }
    });

    return groups;
  }, [debouncedSessions]);

  /**
   * Session istatistikleri
   */
  const sessionStats = useMemo(() => {
    const total = debouncedSessions.length;
    const active = groupedSessions.active.length;
    const paused = groupedSessions.paused.length;
    const completed = groupedSessions.completed.length;
    const cancelled = groupedSessions.cancelled.length;
    const other = groupedSessions.other.length;

    const totalDuration = debouncedSessions.reduce((sum, session) => 
      sum + (session.actualDurationMinutes || 0), 0
    );

    const averageDuration = total > 0 ? totalDuration / total : 0;

    return {
      total,
      active,
      paused,
      completed,
      cancelled,
      other,
      totalDuration,
      averageDuration,
      cacheHitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0
    };
  }, [debouncedSessions, groupedSessions, cacheHits, cacheMisses]);

  /**
   * Cache'i temizle
   */
  const clearCache = useCallback(() => {
    setSessionCache({});
    setCacheHits(0);
    setCacheMisses(0);
  }, []);

  /**
   * Virtualization range'ini güncelle
   */
  const updateVisibleRange = useCallback((start: number, end: number) => {
    setVisibleRange({ start, end });
  }, []);

  /**
   * Item height'ını güncelle
   */
  const updateItemHeight = useCallback((height: number) => {
    setItemHeight(height);
  }, []);

  return {
    // Optimized data
    sessions: enableVirtualization ? virtualizedSessions : debouncedSessions,
    groupedSessions,
    sessionStats,
    
    // Cache operations
    getCachedSession,
    cacheSession,
    clearCache,
    cacheHits,
    cacheMisses,
    
    // Virtualization
    visibleRange,
    updateVisibleRange,
    itemHeight,
    updateItemHeight,
    
    // Performance metrics
    cacheHitRate: sessionStats.cacheHitRate,
    totalSessions: sessionStats.total
  };
};

