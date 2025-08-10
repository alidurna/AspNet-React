/**
 * Real-time Session Updates Hook
 * 
 * Session'ların gerçek zamanlı güncellemelerini yönetir
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { pomodoroAPI, type PomodoroSession } from '../../../services/api/pomodoroAPI';
import { useToast } from '../../../hooks/useToast';

interface UseRealTimeSessionsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
  onSessionUpdate?: (session: PomodoroSession) => void;
  onSessionComplete?: (session: PomodoroSession) => void;
}

/**
 * Real-time Session Updates Hook
 */
export const useRealTimeSessions = (options: UseRealTimeSessionsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableNotifications = true,
    onSessionUpdate,
    onSessionComplete
  } = options;

  const { showSuccess, showInfo } = useToast();
  
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousSessionsRef = useRef<PomodoroSession[]>([]);
  const previousActiveSessionRef = useRef<PomodoroSession | null>(null);

  /**
   * Session'ları yükler
   */
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await pomodoroAPI.getSessions();
      const newSessions = response.sessions || [];
      
      // Aktif session'ı bul
      const newActiveSession = newSessions.find(s => s.state === 'active' || s.state === 'paused') || null;
      
      // Değişiklikleri kontrol et
      const hasChanges = this.checkForChanges(newSessions, newActiveSession);
      
      if (hasChanges) {
        setSessions(newSessions);
        setActiveSession(newActiveSession);
        setLastUpdate(new Date());
        
        // Notification göster
        if (enableNotifications) {
          this.showChangeNotifications(newSessions, newActiveSession);
        }
        
        // Callback'leri çağır
        if (onSessionUpdate && newActiveSession) {
          onSessionUpdate(newActiveSession);
        }
        
        // Tamamlanan session'ları kontrol et
        this.checkCompletedSessions(newSessions);
      }
      
    } catch (error) {
      console.error('Real-time session update error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enableNotifications, onSessionUpdate, onSessionComplete]);

  /**
   * Değişiklikleri kontrol eder
   */
  const checkForChanges = useCallback((
    newSessions: PomodoroSession[],
    newActiveSession: PomodoroSession | null
  ): boolean => {
    // Session sayısı değişti mi?
    if (newSessions.length !== previousSessionsRef.current.length) {
      return true;
    }
    
    // Aktif session değişti mi?
    if (newActiveSession?.id !== previousActiveSessionRef.current?.id) {
      return true;
    }
    
    // Session state'leri değişti mi?
    for (let i = 0; i < newSessions.length; i++) {
      const newSession = newSessions[i];
      const oldSession = previousSessionsRef.current[i];
      
      if (!oldSession || newSession.state !== oldSession.state) {
        return true;
      }
    }
    
    return false;
  }, []);

  /**
   * Değişiklik notification'larını gösterir
   */
  const showChangeNotifications = useCallback((
    newSessions: PomodoroSession[],
    newActiveSession: PomodoroSession | null
  ) => {
    // Yeni aktif session
    if (newActiveSession && newActiveSession.id !== previousActiveSessionRef.current?.id) {
      showSuccess(`${newActiveSession.title} session'ı başladı!`);
    }
    
    // Session state değişiklikleri
    newSessions.forEach(newSession => {
      const oldSession = previousSessionsRef.current.find(s => s.id === newSession.id);
      
      if (oldSession && newSession.state !== oldSession.state) {
        switch (newSession.state) {
          case 'paused':
            showInfo(`${newSession.title} duraklatıldı`);
            break;
          case 'completed':
            showSuccess(`${newSession.title} tamamlandı!`);
            break;
          case 'cancelled':
            showInfo(`${newSession.title} iptal edildi`);
            break;
        }
      }
    });
  }, [showSuccess, showInfo]);

  /**
   * Tamamlanan session'ları kontrol eder
   */
  const checkCompletedSessions = useCallback((newSessions: PomodoroSession[]) => {
    newSessions.forEach(session => {
      const oldSession = previousSessionsRef.current.find(s => s.id === session.id);
      
      if (oldSession && session.state === 'completed' && oldSession.state !== 'completed') {
        if (onSessionComplete) {
          onSessionComplete(session);
        }
      }
    });
  }, [onSessionComplete]);

  /**
   * Real-time updates'i başlatır
   */
  const startRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (autoRefresh) {
      intervalRef.current = setInterval(loadSessions, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, loadSessions]);

  /**
   * Real-time updates'i durdurur
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Manuel yenileme
   */
  const refreshSessions = useCallback(() => {
    loadSessions();
  }, [loadSessions]);

  // Effect'ler
  useEffect(() => {
    // İlk yükleme
    loadSessions();
    
    // Real-time updates'i başlat
    startRealTimeUpdates();
    
    // Cleanup
    return () => {
      stopRealTimeUpdates();
    };
  }, [loadSessions, startRealTimeUpdates, stopRealTimeUpdates]);

  // Previous state'leri güncelle
  useEffect(() => {
    previousSessionsRef.current = sessions;
    previousActiveSessionRef.current = activeSession;
  }, [sessions, activeSession]);

  return {
    sessions,
    activeSession,
    isLoading,
    lastUpdate,
    refreshSessions,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};

