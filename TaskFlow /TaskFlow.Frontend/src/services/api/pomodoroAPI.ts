// ****************************************************************************************************
//  POMODOROAPI.TS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro API servisidir.
//  Frontend'den backend Pomodoro API'sine yapılan istekleri yönetir.
//  Session yönetimi, timer kontrolü ve istatistikler için API çağrıları sağlar.
// ****************************************************************************************************

import { apiClient } from './apiClient';

// Pomodoro Session interface'leri
export interface PomodoroSession {
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

// Backend enum'larını frontend'de tanımla
export const PomodoroSessionType = {
  Work: 0,
  ShortBreak: 1,
  LongBreak: 2
} as const;

export const PomodoroSessionState = {
  Created: 0,
  Working: 1,
  ShortBreak: 2,
  LongBreak: 3,
  Completed: 4,
  Cancelled: 5,
  Paused: 6
} as const;

export interface CreatePomodoroSessionDto {
  title: string;
  description?: string;
  sessionType: number; // 0: Work, 1: Short Break, 2: Long Break
  plannedDurationMinutes: number;
  taskId?: number;
  categoryId?: number;
  notes?: string;
}

export interface UpdatePomodoroSessionDto {
  title?: string;
  description?: string;
  notes?: string;
  taskId?: number;
  categoryId?: number;
}

export interface PomodoroStatistics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  averageSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  currentStreak: number;
  longestStreak: number;
  productivityScore: number;
  weeklyStats: {
    date: string;
    sessions: number;
    workMinutes: number;
    breakMinutes: number;
  }[];
  monthlyStats: {
    month: string;
    sessions: number;
    workMinutes: number;
    breakMinutes: number;
    productivityScore: number;
  }[];
  sessionTypeBreakdown: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
  timeOfDayStats: {
    hour: number;
    sessions: number;
    workMinutes: number;
  }[];
}

export interface PomodoroFilterDto {
  startDate?: string;
  endDate?: string;
  sessionType?: number; // 0: Work, 1: Short Break, 2: Long Break
  state?: number; // 0: Created, 1: Active, 2: Paused, 3: Completed, 4: Cancelled
  taskId?: number;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface PomodoroSessionListDto {
  sessions: PomodoroSession[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Pomodoro API Servisi
 * 
 * Bu servis Pomodoro ile ilgili tüm API çağrılarını yönetir:
 * - Session CRUD işlemleri
 * - Timer kontrolü (start, pause, resume, stop, complete)
 * - İstatistikler ve raporlar
 * - Filtreleme ve arama
 */
export const pomodoroAPI = {
  // ===== SESSION METHODS =====

  /**
   * Session'ları listeler
   */
  getSessions: async (filter?: PomodoroFilterDto): Promise<PomodoroSessionListDto> => {
    try {
      const response = await apiClient.get('/api/v1.0/Pomodoro/sessions', { params: filter });
      return response.data;
    } catch (error) {
      console.error('Session listesi hatası:', error);
      throw error;
    }
  },

  /**
   * Aktif session'ı getirir
   */
  getActiveSession: async (): Promise<PomodoroSession | null> => {
    try {
      const response = await apiClient.get('/api/v1.0/Pomodoro/sessions/active');
      return response.data;
    } catch (error) {
      console.error('Aktif session hatası:', error);
      return null;
    }
  },

  /**
   * Session detayını getirir
   */
  getSessionById: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.get(`/api/v1.0/Pomodoro/sessions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Session detay hatası:', error);
      throw error;
    }
  },

  /**
   * Yeni session oluşturur
   */
  createSession: async (sessionData: CreatePomodoroSessionDto): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post('/api/v1.0/Pomodoro/sessions', sessionData);
      return response.data;
    } catch (error: any) {
      console.error('Session oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session oluşturulamadı';
      throw new Error(errorMessage);
    }
  },

  /**
   * Session'ı günceller
   */
  updateSession: async (id: number, sessionData: UpdatePomodoroSessionDto): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.put(`/api/v1.0/Pomodoro/sessions/${id}`, sessionData);
      return response.data;
    } catch (error: any) {
      console.error('Session güncelleme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session güncellenemedi';
      throw new Error(errorMessage);
    }
  },

  /**
   * Session'ı siler
   */
  deleteSession: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1.0/Pomodoro/sessions/${id}`);
    } catch (error: any) {
      console.error('Session silme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session silinemedi';
      throw new Error(errorMessage);
    }
  },

  // ===== SESSION CONTROL METHODS =====

  /**
   * Session'ı başlatır
   */
  startSession: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${id}/start`);
      return response.data;
    } catch (error: any) {
      console.error('Session başlatma hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Session başlatılamadı';
      throw new Error(errorMessage);
    }
  },

  /**
   * Session'ı duraklatır
   */
  pauseSession: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${id}/pause`);
      return response.data;
    } catch (error) {
      console.error('Session duraklatma hatası:', error);
      throw error;
    }
  },

  /**
   * Session'ı devam ettirir
   */
  resumeSession: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${id}/resume`);
      return response.data;
    } catch (error) {
      console.error('Session devam ettirme hatası:', error);
      throw error;
    }
  },

  /**
   * Session'ı tamamlar
   */
  completeSession: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Session tamamlama hatası:', error);
      throw error;
    }
  },

  /**
   * Session'ı iptal eder
   */
  cancelSession: async (id: number): Promise<PomodoroSession> => {
    try {
      const response = await apiClient.post(`/api/v1.0/Pomodoro/sessions/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Session iptal hatası:', error);
      throw error;
    }
  },
  
  // ===== İSTATİSTİKLER =====
  
  /**
   * İstatistikleri getirir
   */
  getStatistics: async (timeFilter?: string): Promise<PomodoroStatistics> => {
    try {
      const params = timeFilter ? { timeFilter } : {};
      const response = await apiClient.get('/api/v1.0/Pomodoro/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('İstatistik hatası:', error);
      throw error;
    }
  },
  
  /**
   * Timer durumunu getirir
   */
  getTimerStatus: async (): Promise<{
    currentSession: PomodoroSession | null;
    timeLeft: number;
    isRunning: boolean;
  }> => {
    const response = await apiClient.get('/api/v1/Pomodoro/timer/status');
    return response.data;
  },
  
  // ===== HIZLI İŞLEMLER =====
  
  /**
   * Hızlı çalışma session'ı başlatır
   */
  quickStartWork: async (duration: number = 25): Promise<PomodoroSession> => {
    const sessionData: CreatePomodoroSessionDto = {
      title: `Hızlı Çalışma Session'ı`,
      sessionType: PomodoroSessionType.Work,
      plannedDurationMinutes: duration
    };
    
    const session = await pomodoroAPI.createSession(sessionData);
    return await pomodoroAPI.startSession(session.id!);
  },
  
  /**
   * Hızlı kısa mola başlatır
   */
  quickStartShortBreak: async (duration: number = 5): Promise<PomodoroSession> => {
    const sessionData: CreatePomodoroSessionDto = {
      title: 'Kısa Mola',
      sessionType: PomodoroSessionType.ShortBreak,
      plannedDurationMinutes: duration
    };
    
    const session = await pomodoroAPI.createSession(sessionData);
    return await pomodoroAPI.startSession(session.id!);
  },
  
  /**
   * Hızlı uzun mola başlatır
   */
  quickStartLongBreak: async (duration: number = 15): Promise<PomodoroSession> => {
    const sessionData: CreatePomodoroSessionDto = {
      title: 'Uzun Mola',
      sessionType: PomodoroSessionType.LongBreak,
      plannedDurationMinutes: duration
    };
    
    const session = await pomodoroAPI.createSession(sessionData);
    return await pomodoroAPI.startSession(session.id!);
  },
  
  // ===== RAPORLAR =====
  
  /**
   * Günlük rapor getirir
   */
  getDailyReport: async (date: string): Promise<{
    sessions: PomodoroSession[];
    totalWorkMinutes: number;
    totalBreakMinutes: number;
    productivityScore: number;
  }> => {
    const response = await apiClient.get(`/api/v1.0/Pomodoro/reports/daily?date=${date}`);
    return response.data;
  },
  
  /**
   * Haftalık rapor getirir
   */
  getWeeklyReport: async (startDate: string, endDate: string): Promise<{
    dailyStats: Array<{
      date: string;
      sessions: number;
      workMinutes: number;
      breakMinutes: number;
    }>;
    totalWorkMinutes: number;
    totalBreakMinutes: number;
    averageProductivity: number;
  }> => {
    const response = await apiClient.get(`/api/v1.0/Pomodoro/reports/weekly?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  /**
   * Aylık rapor getirir
   */
  getMonthlyReport: async (year: number, month: number): Promise<{
    dailyStats: Array<{
      date: string;
      sessions: number;
      workMinutes: number;
      breakMinutes: number;
    }>;
    totalWorkMinutes: number;
    totalBreakMinutes: number;
    averageProductivity: number;
    topProductiveDays: Array<{
      date: string;
      productivityScore: number;
    }>;
  }> => {
    const response = await apiClient.get(`/api/v1.0/Pomodoro/reports/monthly?year=${year}&month=${month}`);
    return response.data;
  },
  
  // ===== AYARLAR =====
  
  /**
   * Kullanıcının Pomodoro ayarlarını getirir
   */
  getSettings: async (): Promise<{
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  }> => {
    const response = await apiClient.get('/api/v1.0/Pomodoro/settings');
    return response.data;
  },
  
  /**
   * Kullanıcının Pomodoro ayarlarını günceller
   */
  updateSettings: async (settings: {
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
    sessionsBeforeLongBreak?: number;
    autoStartBreaks?: boolean;
    autoStartPomodoros?: boolean;
    soundEnabled?: boolean;
    notificationsEnabled?: boolean;
  }): Promise<void> => {
    await apiClient.put('/api/v1.0/Pomodoro/settings', settings);
  },
  
  // ===== YARDIMCI FONKSİYONLAR =====
  
  /**
   * Session'ın geçerli olup olmadığını kontrol eder
   */
  isValidSession: (session: PomodoroSession): boolean => {
    return session && session.state !== 4; // Not cancelled
  },
  
  /**
   * Session'ın çalışma session'ı olup olmadığını kontrol eder
   */
  isWorkSession: (session: PomodoroSession): boolean => {
    return session.sessionType === 0; // Work
  },
  
  /**
   * Session'ın mola session'ı olup olmadığını kontrol eder
   */
  isBreakSession: (session: PomodoroSession): boolean => {
    return session.sessionType === 1 || session.sessionType === 2; // Short or Long Break
  },
  
  /**
   * Session'ın aktif olup olmadığını kontrol eder
   */
  isActiveSession: (session: PomodoroSession): boolean => {
    return session.state === 1; // Active
  },
  
  /**
   * Session'ın duraklatılmış olup olmadığını kontrol eder
   */
  isPausedSession: (session: PomodoroSession): boolean => {
    return session.state === 2; // Paused
  },
  
  /**
   * Session'ın tamamlanmış olup olmadığını kontrol eder
   */
  isCompletedSession: (session: PomodoroSession): boolean => {
    return session.state === 3; // Completed
  }
};

// ===== NOTIFICATION METHODS =====

/**
 * Email notification gönderir
 */
export const sendEmailNotification = async (sessionId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/api/v1/Pomodoro/sessions/${sessionId}/notify/email`);
    return response.data.success;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
};

/**
 * SMS notification gönderir
 */
export const sendSmsNotification = async (sessionId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/api/v1/Pomodoro/sessions/${sessionId}/notify/sms`);
    return response.data.success;
  } catch (error) {
    console.error('SMS notification error:', error);
    return false;
  }
};

/**
 * Push notification gönderir
 */
export const sendPushNotification = async (sessionId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/api/v1/Pomodoro/sessions/${sessionId}/notify/push`);
    return response.data.success;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
};

/**
 * Notification ayarlarını günceller
 */
export const updateNotificationSettings = async (settings: any): Promise<any> => {
  try {
    const response = await apiClient.put('/api/v1.0/Pomodoro/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Update notification settings error:', error);
    throw error;
  }
};

/**
 * Notification ayarlarını getirir
 */
export const getNotificationSettings = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/v1.0/Pomodoro/notifications/settings');
    return response.data;
  } catch (error) {
    console.error('Get notification settings error:', error);
    throw error;
  }
};

/**
 * Pomodoro ayarlarını getirir
 */
export const getSettings = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/v1.0/Pomodoro/notifications/settings');
    return response.data;
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
};

/**
 * Pomodoro ayarlarını günceller
 */
export const updateSettings = async (settings: any): Promise<any> => {
  try {
    const response = await apiClient.put('/api/v1.0/Pomodoro/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};

export default pomodoroAPI; 