/**
 * Pomodoro Utils
 * 
 * Pomodoro modülü için utility fonksiyonları
 */

import { PomodoroSessionType, PomodoroState } from '../types/pomodoro.types';
import type { PomodoroSession } from '../../../services/api/pomodoroAPI';

/**
 * Zamanı MM:SS formatında döndürür
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Progress percentage hesaplar
 */
export const getProgress = (totalTime: number, timeLeft: number): number => {
  if (totalTime === 0) return 0;
  return ((totalTime - timeLeft) / totalTime) * 100;
};

/**
 * Süreyi saat:dakika formatında döndürür
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}s ${mins}dk`;
  }
  return `${mins}dk`;
};

/**
 * Yüzde formatında döndürür
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Session type'ını string'e çevirir
 */
export const getSessionTypeLabel = (sessionType: number): string => {
  switch (sessionType) {
    case PomodoroSessionType.Work:
      return 'Çalışma';
    case PomodoroSessionType.ShortBreak:
      return 'Kısa Mola';
    case PomodoroSessionType.LongBreak:
      return 'Uzun Mola';
    default:
      return 'Bilinmeyen';
  }
};

/**
 * Session type string'ini number'a çevirir
 */
export const getSessionTypeNumber = (sessionType: string): number => {
  switch (sessionType) {
    case 'work':
      return PomodoroSessionType.Work;
    case 'shortBreak':
      return PomodoroSessionType.ShortBreak;
    case 'longBreak':
      return PomodoroSessionType.LongBreak;
    default:
      return PomodoroSessionType.Work;
  }
};

/**
 * Session state'ini string'e çevirir
 */
export const getSessionStateLabel = (state: number): string => {
  switch (state) {
    case 0: return 'Oluşturuldu';
    case 1: return 'Çalışıyor';
    case 2: return 'Kısa Mola';
    case 3: return 'Uzun Mola';
    case 4: return 'Tamamlandı';
    case 5: return 'İptal Edildi';
    case 6: return 'Duraklatıldı';
    default: return 'Bilinmeyen';
  }
};

/**
 * Session'ın geçerli olup olmadığını kontrol eder
 */
export const isValidSession = (session: any): boolean => {
  return session && session.isActive && !session.isCompleted && !session.isCancelled;
};

/**
 * Session'ın çalışma session'ı olup olmadığını kontrol eder
 */
export const isWorkSession = (session: any): boolean => {
  return session.sessionType === PomodoroSessionType.Work;
};

/**
 * Session'ın mola session'ı olup olmadığını kontrol eder
 */
export const isBreakSession = (session: any): boolean => {
  return session.sessionType === PomodoroSessionType.ShortBreak || 
         session.sessionType === PomodoroSessionType.LongBreak;
};

/**
 * Session'ın aktif olup olmadığını kontrol eder
 */
export const isActiveSession = (session: any): boolean => {
  return session.state === 1; // Working
};

/**
 * Session'ın duraklatılmış olup olmadığını kontrol eder
 */
export const isPausedSession = (session: any): boolean => {
  return session.state === 6; // Paused
};

/**
 * Session'ın tamamlanmış olup olmadığını kontrol eder
 */
export const isCompletedSession = (session: any): boolean => {
  return session.state === 4; // Completed
};

/**
 * Timer state'ini string'e çevirir
 */
export const getTimerStateLabel = (state: string): string => {
  switch (state) {
    case PomodoroState.IDLE:
      return '✨ Hazır';
    case PomodoroState.WORKING:
      return '🔥 Çalışıyor';
    case PomodoroState.PAUSED:
      return '⏸️ Duraklatıldı';
    case PomodoroState.BREAK:
      return '☕ Mola';
    case PomodoroState.COMPLETED:
      return '✅ Tamamlandı';
    default:
      return '❓ Bilinmeyen';
  }
};

/**
 * Timer state'ine göre renk döndürür
 */
export const getTimerStateColor = (state: string): string => {
  switch (state) {
    case PomodoroState.WORKING:
      return 'text-rose-500';
    case PomodoroState.BREAK:
      return 'text-emerald-500';
    case PomodoroState.PAUSED:
      return 'text-amber-500';
    case PomodoroState.COMPLETED:
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
};
