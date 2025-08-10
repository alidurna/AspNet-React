/**
   * Pomodoro Types
 * 
 * Pomodoro modülü için tüm type tanımları
 */

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

// Pomodoro Timer durumları
export const PomodoroState = {
  IDLE: 'idle',
  WORKING: 'working',
  PAUSED: 'paused',
  BREAK: 'break',
  COMPLETED: 'completed'
} as const;

export type PomodoroStateType = typeof PomodoroState[keyof typeof PomodoroState];

// Pomodoro Session interface'i
export interface PomodoroSession {
  id?: number;
  title: string;
  sessionType: number; // 0: Work, 1: Short Break, 2: Long Break
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  startTime?: string;
  endTime?: string;
  state: number; // 0: Created, 1: Active, 2: Paused, 3: Completed, 4: Cancelled
  taskId?: number;
  categoryId?: number;
  description?: string;
  notes?: string;
}

// Timer ayarları
export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

// Pomodoro Statistics
export interface PomodoroStatistics {
  totalSessions: number;
  completedSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  averageSessionDuration: number;
  productivityScore: number;
  streakDays: number;
  bestStreak: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  weeklyTrend: number[];
  monthlyTrend: number[];
  sessionTypeBreakdown: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
}

// Zaman filtresi türleri
export type TimeFilter = 'today' | 'week' | 'month' | 'all';

// Pomodoro Filter DTO
export interface PomodoroFilterDto {
  startDate?: string;
  endDate?: string;
  sessionType?: 'work' | 'short_break' | 'long_break';
  state?: 'active' | 'paused' | 'completed' | 'cancelled';
  taskId?: number;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

// Pomodoro Session List DTO
export interface PomodoroSessionListDto {
  sessions: PomodoroSession[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Create Pomodoro Session DTO
export interface CreatePomodoroSessionDto {
  title: string;
  description?: string;
  sessionType: number; // Backend enum değeri
  plannedDurationMinutes: number;
  taskId?: number;
  categoryId?: number;
  notes?: string;
}

// Update Pomodoro Session DTO
export interface UpdatePomodoroSessionDto {
  title?: string;
  description?: string;
  notes?: string;
}

/**
 * Pomodoro Session State Machine Types
 */

export enum SessionState {
  DRAFT = 'draft',           // Taslak - henüz kaydedilmemiş
  CREATED = 'created',       // Oluşturuldu - veritabanında
  SCHEDULED = 'scheduled',   // Planlandı - belirli zamanda başlayacak
  READY = 'ready',           // Hazır - başlatılabilir
  ACTIVE = 'active',         // Aktif - çalışıyor
  PAUSED = 'paused',         // Duraklatıldı
  RESUMED = 'resumed',       // Devam ediyor
  COMPLETED = 'completed',   // Tamamlandı
  CANCELLED = 'cancelled',   // İptal edildi
  ARCHIVED = 'archived'      // Arşivlendi
}

export enum SessionType {
  WORK = 'work',             // Çalışma session'ı
  SHORT_BREAK = 'short_break', // Kısa mola
  LONG_BREAK = 'long_break',   // Uzun mola
  CUSTOM = 'custom'          // Özel session
}

export enum SessionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface SessionTransition {
  from: SessionState;
  to: SessionState;
  condition?: (session: PomodoroSession) => boolean;
  action?: (session: PomodoroSession) => Promise<void>;
}

export interface SessionStateMachine {
  canTransition(from: SessionState, to: SessionState): boolean;
  validateTransition(from: SessionState, to: SessionState): void;
  getValidTransitions(from: SessionState): SessionState[];
  executeTransition(session: PomodoroSession, to: SessionState): Promise<PomodoroSession>;
}
