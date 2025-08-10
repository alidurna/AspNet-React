/**
 * usePomodoroTimer Hook
 * 
 * Pomodoro timer'ının ana logic'ini yönetir
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { apiClient } from '../../../services/api/apiClient';
import { pomodoroAPI, sendEmailNotification, sendSmsNotification, sendPushNotification } from '../../../services/api/pomodoroAPI';
import { 
  PomodoroState, 
  PomodoroSessionType,
  PomodoroSessionState
} from '../types';
import type { 
  PomodoroStateType, 
  PomodoroSession, 
  PomodoroSettings 
} from '../types';
import { formatTime, getProgress } from '../utils';

/**
 * Pomodoro Timer Hook
 */
export const usePomodoroTimer = () => {
  // ===== HOOKS =====
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
  // ===== STATE =====
  const [currentState, setCurrentState] = useState<PomodoroStateType>(PomodoroState.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Form state
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  
  // Ayarlar
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false
  });
  
  // ===== REFS =====
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // ===== TIMER FUNCTIONS =====
  
  /**
   * Timer interval'ını başlatır
   */
  const startInterval = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  
  /**
   * Timer interval'ını durdurur
   */
  const stopInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  /**
   * Timer tamamlandığında çağrılır
   */
  const handleTimerComplete = useCallback(async () => {
    if (!currentSession) return;

    console.log('Timer completed, sending notifications...');
    
    // Ses çal
    if (settings.soundEnabled) {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }

    // Notification gönder
    try {
      if (settings.emailNotifications && currentSession.id) {
        await sendEmailNotification(currentSession.id);
        console.log('Email notification sent');
      }
      
      if (settings.smsNotifications && currentSession.id) {
        await sendSmsNotification(currentSession.id);
        console.log('SMS notification sent');
      }
      
      if (settings.pushNotifications && currentSession.id) {
        await sendPushNotification(currentSession.id);
        console.log('Push notification sent');
      }
    } catch (error) {
      console.error('Notification error:', error);
    }

    // Session'ı tamamla
    try {
      if (currentSession.id) {
        await pomodoroAPI.completeSession(currentSession.id);
        console.log('Session completed successfully');
      }
      
      // Session durumunu güncelle
      setCurrentSession(prev => prev ? { ...prev, state: PomodoroSessionState.Completed } : null);
      setCurrentState(PomodoroState.IDLE);
      setIsRunning(false);
      
      // Başarı mesajı göster
      showSuccess('Session tamamlandı! 🎉');
      
      // Otomatik başlatma mantığı
      if (settings.autoStartBreaks && currentSession.sessionType === PomodoroSessionType.Work) {
        // Çalışma session'ı bittikten sonra mola başlat
        const nextBreakType = sessionCount % settings.longBreakInterval === 0 
          ? PomodoroSessionType.LongBreak 
          : PomodoroSessionType.ShortBreak;
        
        const breakDuration = nextBreakType === PomodoroSessionType.LongBreak 
          ? settings.longBreakDuration 
          : settings.shortBreakDuration;
        
        // startSession fonksiyonunu doğru parametrelerle çağır
        setTimeout(() => {
          const sessionType = nextBreakType;
          startSession(sessionType);
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Session completion error:', error);
      showError('Session tamamlanamadı');
    }
  }, [currentSession, settings, sessionCount, showSuccess, showError]);
  
  /**
   * Yeni session başlatır
   */
  const startSession = useCallback(async (sessionType: number = 0) => {
    console.log('🚀 startSession called with sessionType:', sessionType);
    
    if (!user) {
      console.error('❌ User not authenticated');
      showError('Giriş yapmış olmanız gerekiyor');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('⏳ Starting session creation...');
      
      console.log('🔍 Checking for active session...');
      
      // Önce aktif session olup olmadığını kontrol et
      const activeSession = await pomodoroAPI.getActiveSession();
      console.log('📊 Active session check result:', activeSession);
      
      if (activeSession) {
        console.log('⚠️ Active session found, asking user for confirmation...');
        const shouldClear = window.confirm(
          `Zaten aktif bir session'ınız var: "${activeSession.title}"\n\n` +
          'Yeni session başlatmak için mevcut session\'ı iptal etmek gerekiyor. Devam etmek istiyor musunuz?'
        );
        
        if (shouldClear) {
          console.log('🗑️ User confirmed, clearing active session...');
          await pomodoroAPI.clearActiveSession();
          showInfo('Aktif session temizlendi');
        } else {
          console.log('❌ User cancelled session creation');
          return;
        }
      }
      
      // Session başlığını belirle
      const title = sessionType === 0 
        ? sessionTitle || `Pomodoro Session ${sessionCount + 1}`
        : sessionType === 1 
          ? 'Kısa Mola'
          : 'Uzun Mola';
      
      console.log('📝 Session title:', title);
      
      // Session süresini belirle
      const duration = sessionType === 0 
        ? settings.workDuration 
        : sessionType === 1 
          ? settings.shortBreakDuration 
          : settings.longBreakDuration;
      
      console.log('⏰ Session duration:', duration, 'minutes');
      
      // SessionType mapping - Backend enum'larına uygun
      const sessionTypeMap = {
        0: PomodoroSessionType.Work,
        1: PomodoroSessionType.ShortBreak, 
        2: PomodoroSessionType.LongBreak
      };
      
      // Yeni session oluştur
      const newSession = {
        title,
        sessionType: sessionTypeMap[sessionType as keyof typeof sessionTypeMap],
        plannedDurationMinutes: duration,
        taskId: selectedTaskId,
        categoryId: selectedCategoryId,
        description: '',
        notes: ''
      };
      
      console.log('🚀 Creating session with data:', newSession);
      
      // API'ye session kaydet
      const response = await apiClient.post('/api/v1.0/Pomodoro/sessions', newSession);
      const savedSession = response.data;
      
      console.log('✅ Session created successfully:', savedSession);
      
      // Session'ı başlat
      if (savedSession.id) {
        console.log('▶️ Starting session with ID:', savedSession.id);
        const startedSession = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${savedSession.id}/start`);
        console.log('✅ Session started successfully:', startedSession.data);
        
        // State'leri güncelle
        setCurrentSession(startedSession.data);
        setCurrentState(sessionType === 0 ? PomodoroState.WORKING : PomodoroState.BREAK);
        setTimeLeft(duration * 60);
        setTotalTime(duration * 60);
        setIsRunning(true);
        
        if (sessionType === 0) {
          setSessionCount(prev => prev + 1);
        }
        
        // Timer'ı başlat
        startInterval();
        
        showSuccess(`${title} başlatıldı!`);
        console.log('🎉 Timer started successfully!');
      }
      
    } catch (error: unknown) {
      console.error('❌ Timer başlatma hatası:', error);
      
      // Detaylı hata analizi
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        console.error('📊 Response status:', response?.status);
        console.error('📊 Response data:', response?.data);
        console.error('📊 Response headers:', response?.headers);
      }
      
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'Session başlatılamadı';
      showError(errorMessage || 'Session başlatılamadı');
    } finally {
      setIsLoading(false);
      console.log('🏁 Session creation process completed');
    }
  }, [user, sessionTitle, sessionCount, settings, selectedTaskId, selectedCategoryId, startInterval, showSuccess, showError, showInfo]);
  
  /**
   * Timer'ı duraklatır
   */
  const pauseTimer = useCallback(async () => {
    if (!currentSession || !isRunning) return;
    
    try {
      setIsLoading(true);
      
      console.log('⏸️ Pausing session:', currentSession.id);
      
      // API'ye pause gönder
              const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${currentSession.id}/pause`);
      console.log('✅ Session paused:', response.data);
      
      // State'leri güncelle
      setCurrentSession(response.data);
      setCurrentState(PomodoroState.PAUSED);
      setIsRunning(false);
      stopInterval();
      
      showInfo('Timer duraklatıldı');
      
    } catch (error: unknown) {
      console.error('❌ Timer duraklatma hatası:', error);
      showError('Timer duraklatılamadı');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, isRunning, stopInterval, showInfo, showError]);
  
  /**
   * Timer'ı devam ettirir
   */
  const resumeTimer = useCallback(async () => {
    if (!currentSession || isRunning) return;
    
    try {
      setIsLoading(true);
      
      console.log('▶️ Resuming session:', currentSession.id);
      
      // API'ye resume gönder
              const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${currentSession.id}/resume`);
      console.log('✅ Session resumed:', response.data);
      
      // State'leri güncelle
      setCurrentSession(response.data);
      setCurrentState(currentSession.sessionType === 0 ? PomodoroState.WORKING : PomodoroState.BREAK);
      setIsRunning(true);
      startInterval();
      
      showInfo('Timer devam ettirildi');
      
    } catch (error: unknown) {
      console.error('❌ Timer devam ettirme hatası:', error);
      showError('Timer devam ettirilemedi');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, isRunning, startInterval, showInfo, showError]);
  
  /**
   * Timer'ı durdurur
   */
  const stopTimer = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      setIsLoading(true);
      
      console.log('⏹️ Stopping session:', currentSession.id);
      
      // API'ye stop gönder
              const response = await apiClient.post(`/api/v1.0/Pomodoro/timer/stop`);
      console.log('✅ Timer stopped:', response.data);
      
      // State'leri sıfırla
      setCurrentState(PomodoroState.IDLE);
      setTimeLeft(0);
      setTotalTime(0);
      setIsRunning(false);
      setCurrentSession(null);
      stopInterval();
      
      showInfo('Timer durduruldu');
      
    } catch (error: unknown) {
      console.error('❌ Timer durdurma hatası:', error);
      showError('Timer durdurulamadı');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, stopInterval, showInfo, showError]);
  
  /**
   * Session Management'tan gelen session'ı başlatır
   */
  const startExistingSession = useCallback(async (session: any) => {
    console.log('🚀 startExistingSession called with session:', session);
    
    if (!user) {
      console.error('❌ User not authenticated');
      showError('Giriş yapmış olmanız gerekiyor');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('⏳ Starting existing session...');
      
      // Session'ı başlat
      if (session.id) {
        console.log('▶️ Starting session with ID:', session.id);
        const startedSession = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${session.id}/start`);
        console.log('✅ Session started successfully:', startedSession.data);
        
        // State'leri güncelle
        setCurrentSession(startedSession.data);
        
        // Session tipine göre state'i ayarla
        const sessionType = session.sessionType;
        if (sessionType === 'work') {
          setCurrentState(PomodoroState.WORKING);
        } else if (sessionType === 'short_break' || sessionType === 'long_break') {
          setCurrentState(PomodoroState.BREAK);
        }
        
        setTimeLeft(session.plannedDurationMinutes * 60);
        setTotalTime(session.plannedDurationMinutes * 60);
        setIsRunning(true);
        
        // Timer'ı başlat
        startInterval();
        
        showSuccess(`${session.title} session'ı başlatıldı!`);
      }
      
    } catch (error) {
      console.error('❌ Session start error:', error);
      showError('Session başlatılamadı');
    } finally {
      setIsLoading(false);
    }
  }, [user, showSuccess, showError, startInterval]);
  
  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Zamanı formatlar
   */
  const formatTimeDisplay = useCallback((seconds: number): string => {
    return formatTime(seconds);
  }, []);
  
  /**
   * Progress hesaplar
   */
  const getProgressPercentage = useCallback((): number => {
    return getProgress(totalTime, timeLeft);
  }, [totalTime, timeLeft]);

  /**
   * Ses dosyasını yükler
   */
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.preload = 'auto';
    
    return () => {
      stopInterval();
    };
  }, [stopInterval]);
  
  return {
    // State
    currentState,
    timeLeft,
    totalTime,
    isRunning,
    currentSession,
    sessionCount,
    completedSessions,
    isLoading,
    sessionTitle,
    selectedTaskId,
    selectedCategoryId,
    settings,
    
    // Actions
    startSession,
    startExistingSession,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setSessionTitle,
    setSelectedTaskId,
    setSelectedCategoryId,
    setSettings,
    
    // Utils
    formatTimeDisplay,
    getProgressPercentage
  };
};
