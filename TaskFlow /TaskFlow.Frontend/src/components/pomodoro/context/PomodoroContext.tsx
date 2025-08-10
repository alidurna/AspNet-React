/**
 * Pomodoro Context - Merkezi State Management
 * 
 * Tüm Pomodoro bileşenlerinin senkronize çalışmasını sağlar
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { pomodoroAPI, type CreatePomodoroSessionDto } from '../../../services/api/pomodoroAPI';
import { useToast } from '../../../hooks/useToast';

// ===== TYPES =====

interface PomodoroSession {
  id?: number;
  title: string;
  description?: string;
  sessionType: number; // 0: Work, 1: Short Break, 2: Long Break
  state: number; // 0: Created, 1: Active, 2: Paused, 3: Completed, 4: Cancelled
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  taskId?: number;
  categoryId?: number;
}

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalDurationMinutes: number;
  averageSessionDuration: number;
  sessionTypeDistribution: any[];
  bestDay?: {
    date: string;
    duration: number;
  };
  dailyGoal: number;
  weeklyGoal: number;
  goalCompletionRate: number;
  recentSessions: PomodoroSession[];
}

interface PomodoroState {
  // Session Management
  sessions: PomodoroSession[];
  activeSession: PomodoroSession | null;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  // Timer State
  currentTime: number;
  isRunning: boolean;
  currentState: 'idle' | 'working' | 'paused' | 'break' | 'completed';
  
  // Settings
  settings: PomodoroSettings;
  
  // Analytics
  stats: PomodoroStats | null;
  statsLoading: boolean;
  
  // UI State
  showSessionManagement: boolean;
  showAnalytics: boolean;
  showSettings: boolean;
}

// ===== ACTIONS =====

type PomodoroAction =
  | { type: 'SET_SESSIONS'; payload: PomodoroSession[] }
  | { type: 'ADD_SESSION'; payload: PomodoroSession }
  | { type: 'UPDATE_SESSION'; payload: PomodoroSession }
  | { type: 'DELETE_SESSION'; payload: number }
  | { type: 'SET_ACTIVE_SESSION'; payload: PomodoroSession | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_IS_RUNNING'; payload: boolean }
  | { type: 'SET_CURRENT_STATE'; payload: PomodoroState['currentState'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PomodoroSettings> }
  | { type: 'SET_STATS'; payload: PomodoroStats }
  | { type: 'SET_STATS_LOADING'; payload: boolean }
  | { type: 'SET_UI_STATE'; payload: Partial<Pick<PomodoroState, 'showSessionManagement' | 'showAnalytics' | 'showSettings'>> }
  | { type: 'REFRESH_DATA' };

// ===== REDUCER =====

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, lastUpdate: new Date() };
    
    case 'ADD_SESSION':
      return { 
        ...state, 
        sessions: [...state.sessions, action.payload],
        lastUpdate: new Date()
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s),
        activeSession: state.activeSession?.id === action.payload.id ? action.payload : state.activeSession,
        lastUpdate: new Date()
      };
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
        activeSession: state.activeSession?.id === action.payload ? null : state.activeSession,
        lastUpdate: new Date()
      };
    
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'SET_IS_RUNNING':
      return { ...state, isRunning: action.payload };
    
    case 'SET_CURRENT_STATE':
      return { ...state, currentState: action.payload };
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_STATS_LOADING':
      return { ...state, statsLoading: action.payload };
    
    case 'SET_UI_STATE':
      return { ...state, ...action.payload };
    
    case 'REFRESH_DATA':
      return { ...state, lastUpdate: new Date() };
    
    default:
      return state;
  }
};

// ===== INITIAL STATE =====

const initialState: PomodoroState = {
  sessions: [],
  activeSession: null,
  isLoading: false,
  lastUpdate: null,
  currentTime: 0,
  isRunning: false,
  currentState: 'idle',
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
  },
  stats: null,
  statsLoading: false,
  showSessionManagement: false,
  showAnalytics: false,
  showSettings: false,
};

// ===== CONTEXT =====

interface PomodoroContextType {
  state: PomodoroState;
  dispatch: React.Dispatch<PomodoroAction>;
  
  // Session Management Actions
  loadSessions: () => Promise<void>;
  createSession: (sessionData: Partial<PomodoroSession>) => Promise<PomodoroSession | null>;
  startSession: (sessionId: number) => Promise<void>;
  pauseSession: (sessionId: number) => Promise<void>;
  resumeSession: (sessionId: number) => Promise<void>;
  stopSession: (sessionId: number) => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  
  // Timer Actions
  startTimer: (sessionType: number) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<PomodoroSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Analytics Actions
  loadStats: (timeFilter?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  
  // UI Actions
  setShowSessionManagement: (show: boolean) => void;
  setShowAnalytics: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

// ===== PROVIDER =====

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);
  const { showSuccess, showError } = useToast();

  // ===== SESSION MANAGEMENT ACTIONS =====

  const loadSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await pomodoroAPI.getSessions();
      const sessions = response.sessions || [];
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
      
      // Aktif session'ı bul ve ayarla - sadece Working state'teki session'ları aktif kabul et
      const activeSession = sessions.find(s => s.state === 1); // 1 = Working
      if (activeSession) {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: activeSession });
        dispatch({ type: 'SET_IS_RUNNING', payload: true });
        dispatch({ type: 'SET_CURRENT_STATE', payload: 'working' });
      } else {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
        dispatch({ type: 'SET_IS_RUNNING', payload: false });
        dispatch({ type: 'SET_CURRENT_STATE', payload: 'idle' });
      }
    } catch (error) {
      console.error('Session yükleme hatası:', error);
      showError('Session\'lar yüklenemedi');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [showError, dispatch]);

  // loadSessions fonksiyonunu ref olarak tut ki dependency cycle olmasın
  const loadSessionsRef = useRef(loadSessions);
  loadSessionsRef.current = loadSessions;

  const createSession = useCallback(async (sessionData: Partial<PomodoroSession>): Promise<PomodoroSession | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Aktif session kontrolü - backend'de de kontrol ediliyor ama frontend'de de kontrol edelim
      const activeSession = state.sessions.find(s => s.state === 1); // 1 = Working
      if (activeSession) {
        showError('Zaten aktif bir session\'ınız var. Önce mevcut session\'ı tamamlayın.');
        return null;
      }

      const createData: CreatePomodoroSessionDto = {
        title: sessionData.title || 'Yeni Session',
        description: sessionData.description || '',
        sessionType: sessionData.sessionType || 0,
        plannedDurationMinutes: sessionData.plannedDurationMinutes || 25,
        taskId: sessionData.taskId,
        categoryId: sessionData.categoryId,
        notes: sessionData.notes
      };
      
      const response = await pomodoroAPI.createSession(createData);
      dispatch({ type: 'ADD_SESSION', payload: response });
      showSuccess('Session oluşturuldu');
      return response;
    } catch (error: any) {
      console.error('Session oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session oluşturulamadı';
      showError(errorMessage);
      
      // Eğer backend'den "zaten aktif session var" hatası gelirse, frontend state'ini güncelle
      if (errorMessage.includes('Zaten aktif bir session')) {
        // Backend'den güncel session listesini al
        try {
          await loadSessionsRef.current();
        } catch (loadError) {
          console.error('Session listesi yüklenirken hata:', loadError);
        }
      }
      
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.sessions, showSuccess, showError]);

  const startSession = useCallback(async (sessionId: number) => {
    try {
      // Aktif session kontrolü - backend'de de kontrol ediliyor ama frontend'de de kontrol edelim
      const activeSession = state.sessions.find(s => s.state === 1); // 1 = Working
      if (activeSession && activeSession.id !== sessionId) {
        showError('Zaten aktif bir session\'ınız var. Önce mevcut session\'ı tamamlayın.');
        return;
      }

      const response = await pomodoroAPI.startSession(sessionId);
      dispatch({ type: 'UPDATE_SESSION', payload: response });
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: response });
      dispatch({ type: 'SET_IS_RUNNING', payload: true });
      dispatch({ type: 'SET_CURRENT_STATE', payload: 'working' });
      showSuccess('Session başlatıldı');
    } catch (error: any) {
      console.error('Session başlatma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session başlatılamadı';
      showError(errorMessage);
      
      // Eğer backend'den "zaten aktif session var" hatası gelirse, frontend state'ini güncelle
      if (errorMessage.includes('Zaten aktif bir session')) {
        // Backend'den güncel session listesini al
        try {
          await loadSessionsRef.current();
        } catch (loadError) {
          console.error('Session listesi yüklenirken hata:', loadError);
        }
      }
      
      throw error;
    }
  }, [state.sessions, showSuccess, showError]);

  const pauseSession = useCallback(async (sessionId: number) => {
    try {
      const response = await pomodoroAPI.pauseSession(sessionId);
      dispatch({ type: 'UPDATE_SESSION', payload: response });
      showSuccess('Session duraklatıldı');
    } catch (error) {
      console.error('Session duraklatma hatası:', error);
      showError('Session duraklatılamadı');
    }
  }, [showSuccess, showError]);

  const resumeSession = useCallback(async (sessionId: number) => {
    try {
      const response = await pomodoroAPI.resumeSession(sessionId);
      dispatch({ type: 'UPDATE_SESSION', payload: response });
      showSuccess('Session devam ettiriliyor');
    } catch (error) {
      console.error('Session devam ettirme hatası:', error);
      showError('Session devam ettirilemedi');
    }
  }, [showSuccess, showError]);

  const stopSession = useCallback(async (sessionId: number) => {
    try {
      const response = await pomodoroAPI.completeSession(sessionId);
      dispatch({ type: 'UPDATE_SESSION', payload: response });
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
      dispatch({ type: 'SET_IS_RUNNING', payload: false });
      dispatch({ type: 'SET_CURRENT_STATE', payload: 'idle' });
      showSuccess('Session durduruldu');
    } catch (error: any) {
      console.error('Session durdurma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session durdurulamadı';
      showError(errorMessage);
    }
  }, [showSuccess, showError]);

  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      await pomodoroAPI.deleteSession(sessionId);
      dispatch({ type: 'DELETE_SESSION', payload: sessionId });
      
      // Eğer silinen session aktif session ise, aktif session'ı temizle
      if (state.activeSession?.id === sessionId) {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
        dispatch({ type: 'SET_IS_RUNNING', payload: false });
        dispatch({ type: 'SET_CURRENT_STATE', payload: 'idle' });
      }
      
      showSuccess('Session silindi');
    } catch (error: any) {
      console.error('Session silme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session silinemedi';
      showError(errorMessage);
    }
  }, [state.activeSession, showSuccess, showError]);

  // ===== TIMER ACTIONS =====

  const startTimer = useCallback(async (sessionType: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Aktif session kontrolü - backend'de de kontrol ediliyor ama frontend'de de kontrol edelim
      const activeSession = state.sessions.find(s => s.state === 1); // 1 = Working
      if (activeSession) {
        showError('Zaten aktif bir session\'ınız var. Önce mevcut session\'ı tamamlayın.');
        return;
      }

      const sessionData = {
        title: sessionType === 0 ? 'Çalışma Session' : 
               sessionType === 1 ? 'Kısa Mola' : 'Uzun Mola',
        sessionType,
        plannedDurationMinutes: sessionType === 0 ? state.settings.workDuration : 
                               sessionType === 1 ? state.settings.shortBreakDuration : 
                               state.settings.longBreakDuration,
      };
      
      // Session oluştur ve başlat
      const newSession = await createSession(sessionData);
      if (newSession?.id) {
        await startSession(newSession.id);
      }
    } catch (error: any) {
      console.error('Timer başlatma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Timer başlatılamadı';
      showError(errorMessage);
      
      // Eğer backend'den "zaten aktif session var" hatası gelirse, frontend state'ini güncelle
      if (errorMessage.includes('Zaten aktif bir session')) {
        // Backend'den güncel session listesini al
        try {
          await loadSessionsRef.current();
        } catch (loadError) {
          console.error('Session listesi yüklenirken hata:', loadError);
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.sessions, state.settings, createSession, startSession, showError]);

  const pauseTimer = useCallback(() => {
    if (state.activeSession?.id) {
      pauseSession(state.activeSession.id);
    }
    dispatch({ type: 'SET_IS_RUNNING', payload: false });
  }, [state.activeSession, pauseSession]);

  const resumeTimer = useCallback(() => {
    if (state.activeSession?.id) {
      resumeSession(state.activeSession.id);
    }
    dispatch({ type: 'SET_IS_RUNNING', payload: true });
  }, [state.activeSession, resumeSession]);

  const stopTimer = useCallback(() => {
    if (state.activeSession?.id) {
      stopSession(state.activeSession.id);
    }
    dispatch({ type: 'SET_IS_RUNNING', payload: false });
    dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
  }, [state.activeSession, stopSession]);

  // ===== SETTINGS ACTIONS =====

  const updateSettings = useCallback(async (newSettings: Partial<PomodoroSettings>) => {
    try {
      // Backend'de sadece notification settings var, pomodoro settings yok
      // Şimdilik local state'te güncelliyoruz
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      showSuccess('Ayarlar güncellendi');
    } catch (error) {
      console.error('Ayar güncelleme hatası:', error);
      showError('Ayarlar güncellenemedi');
    }
  }, [showSuccess, showError]);

  const loadSettings = useCallback(async () => {
    try {
      // Backend'de sadece notification settings var, pomodoro settings yok
      // Şimdilik default değerleri kullanıyoruz
      const defaultSettings: PomodoroSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
      };
      dispatch({ type: 'UPDATE_SETTINGS', payload: defaultSettings });
    } catch (error) {
      console.error('Ayar yükleme hatası:', error);
    }
  }, []);

  // loadSettings fonksiyonunu ref olarak tut
  const loadSettingsRef = useRef(loadSettings);
  loadSettingsRef.current = loadSettings;

  // ===== ANALYTICS ACTIONS =====

  const loadStats = useCallback(async (timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    try {
      dispatch({ type: 'SET_STATS_LOADING', payload: true });
      const response = await pomodoroAPI.getStatistics(timeFilter);
      // PomodoroStatistics'ten PomodoroStats'a dönüşüm
      const stats: PomodoroStats = {
        totalSessions: response.totalSessions || 0,
        completedSessions: response.completedSessions || 0,
        totalDurationMinutes: response.totalWorkMinutes || 0,
        averageSessionDuration: response.averageSessionDuration || 0,
        sessionTypeDistribution: response.sessionTypeBreakdown ? [
          { sessionType: 0, count: response.sessionTypeBreakdown.work || 0, totalDuration: 0 },
          { sessionType: 1, count: response.sessionTypeBreakdown.shortBreak || 0, totalDuration: 0 },
          { sessionType: 2, count: response.sessionTypeBreakdown.longBreak || 0, totalDuration: 0 }
        ] : [],
        bestDay: response.weeklyStats?.[0] ? {
          date: response.weeklyStats[0].date,
          duration: response.weeklyStats[0].workMinutes
        } : undefined,
        dailyGoal: 0,
        weeklyGoal: 0,
        goalCompletionRate: 0,
        recentSessions: []
      };
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      showError('İstatistikler yüklenemedi');
    } finally {
      dispatch({ type: 'SET_STATS_LOADING', payload: false });
    }
  }, [showError]);

  // loadStats fonksiyonunu ref olarak tut
  const loadStatsRef = useRef(loadStats);
  loadStatsRef.current = loadStats;

  // ===== UI ACTIONS =====

  const setShowSessionManagement = useCallback((show: boolean) => {
    dispatch({ type: 'SET_UI_STATE', payload: { showSessionManagement: show } });
  }, []);

  const setShowAnalytics = useCallback((show: boolean) => {
    dispatch({ type: 'SET_UI_STATE', payload: { showAnalytics: show } });
  }, []);

  const setShowSettings = useCallback((show: boolean) => {
    dispatch({ type: 'SET_UI_STATE', payload: { showSettings: show } });
  }, []);

  // ===== EFFECTS =====

  useEffect(() => {
    loadSessionsRef.current();
    loadSettingsRef.current();
    loadStatsRef.current();
  }, []);

  // Auto-refresh sessions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSessionsRef.current();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ===== CONTEXT VALUE =====

  const contextValue: PomodoroContextType = {
    state,
    dispatch,
    loadSessions,
    createSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    deleteSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateSettings,
    loadSettings,
    loadStats,
    setShowSessionManagement,
    setShowAnalytics,
    setShowSettings,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

// ===== HOOK =====

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
