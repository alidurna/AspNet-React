/**
 * Session State Machine Implementation
 * 
 * Pomodoro session'larının state geçişlerini yönetir
 */

import type { PomodoroSession } from '../../../services/api/pomodoroAPI';
import { pomodoroAPI } from '../../../services/api/pomodoroAPI';

// Session State constants
export const SessionState = {
  DRAFT: 'draft',
  CREATED: 'created',
  SCHEDULED: 'scheduled',
  READY: 'ready',
  ACTIVE: 'active',
  PAUSED: 'paused',
  RESUMED: 'resumed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
} as const;

export type SessionStateType = typeof SessionState[keyof typeof SessionState];

/**
 * Session State Machine Class
 */
export class SessionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    [SessionState.DRAFT]: [SessionState.CREATED, SessionState.CANCELLED],
    [SessionState.CREATED]: [SessionState.READY, SessionState.SCHEDULED, SessionState.CANCELLED],
    [SessionState.SCHEDULED]: [SessionState.READY, SessionState.CANCELLED],
    [SessionState.READY]: [SessionState.ACTIVE, SessionState.CANCELLED],
    [SessionState.ACTIVE]: [SessionState.PAUSED, SessionState.COMPLETED, SessionState.CANCELLED],
    [SessionState.PAUSED]: [SessionState.ACTIVE, SessionState.COMPLETED, SessionState.CANCELLED],
    [SessionState.RESUMED]: [SessionState.ACTIVE, SessionState.PAUSED, SessionState.COMPLETED],
    [SessionState.COMPLETED]: [SessionState.ARCHIVED],
    [SessionState.CANCELLED]: [SessionState.ARCHIVED],
    [SessionState.ARCHIVED]: []
  };

  /**
   * State geçişinin mümkün olup olmadığını kontrol eder
   */
  static canTransition(from: string, to: string): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) || false;
  }

  /**
   * State geçişini validate eder
   */
  static validateTransition(from: string, to: string): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid state transition: ${from} → ${to}`);
    }
  }

  /**
   * Belirli bir state'den geçilebilecek state'leri döndürür
   */
  static getValidTransitions(from: string): string[] {
    return this.VALID_TRANSITIONS[from] || [];
  }

  /**
   * Session state geçişini execute eder
   */
  static async executeTransition(session: PomodoroSession, to: string): Promise<PomodoroSession> {
    // State geçişini validate et
    const currentState = this.getSessionStateFromNumber(session.state);
    this.validateTransition(currentState, to);

    // State'e göre API çağrısı yap
    switch (to) {
      case SessionState.ACTIVE:
        const startedSession = await pomodoroAPI.startSession(session.id!);
        return this.convertAPISessionToLocalSession(startedSession);
      
      case SessionState.PAUSED:
        const pausedSession = await pomodoroAPI.pauseSession(session.id!);
        return this.convertAPISessionToLocalSession(pausedSession);
      
      case SessionState.COMPLETED:
        const completedSession = await pomodoroAPI.completeSession(session.id!);
        return this.convertAPISessionToLocalSession(completedSession);
      
      case SessionState.CANCELLED:
        const cancelledSession = await pomodoroAPI.cancelSession(session.id!);
        return this.convertAPISessionToLocalSession(cancelledSession);
      
      case SessionState.ARCHIVED:
        // Archive işlemi için özel endpoint gerekebilir
        return { ...session, state: this.getSessionStateNumber(to) };
      
      default:
        // Diğer state'ler için sadece local update
        return { ...session, state: this.getSessionStateNumber(to) };
    }
  }

  /**
   * Session'ın mevcut durumunu kontrol eder
   */
  static getSessionStatus(session: PomodoroSession): string {
    const state = this.getSessionStateFromNumber(session.state);
    switch (state) {
      case SessionState.DRAFT:
        return 'Taslak';
      case SessionState.CREATED:
        return 'Olusturuldu';
      case SessionState.SCHEDULED:
        return 'Planlandi';
      case SessionState.READY:
        return 'Hazir';
      case SessionState.ACTIVE:
        return 'Calisiyor';
      case SessionState.PAUSED:
        return 'Duraklatildi';
      case SessionState.RESUMED:
        return 'Devam Ediyor';
      case SessionState.COMPLETED:
        return 'Tamamlandi';
      case SessionState.CANCELLED:
        return 'Iptal Edildi';
      case SessionState.ARCHIVED:
        return 'Arsivlendi';
      default:
        return 'Bilinmiyor';
    }
  }

  /**
   * Session'ın rengini döndürür
   */
  static getSessionColor(session: PomodoroSession): string {
    const state = this.getSessionStateFromNumber(session.state);
    switch (state) {
      case SessionState.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case SessionState.PAUSED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case SessionState.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SessionState.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case SessionState.READY:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  }

  /**
   * Number state'i string'e çevirir
   */
  private static getSessionStateFromNumber(stateNumber: number): string {
    switch (stateNumber) {
      case 0: return SessionState.CREATED;
      case 1: return SessionState.ACTIVE;
      case 2: return SessionState.PAUSED;
      case 3: return SessionState.COMPLETED;
      case 4: return SessionState.CANCELLED;
      case 5: return SessionState.ARCHIVED;
      case 6: return SessionState.READY;
      default: return SessionState.DRAFT;
    }
  }

  /**
   * String state'i number'a çevirir
   */
  private static getSessionStateNumber(state: string): number {
    switch (state) {
      case SessionState.CREATED: return 0;
      case SessionState.ACTIVE: return 1;
      case SessionState.PAUSED: return 2;
      case SessionState.COMPLETED: return 3;
      case SessionState.CANCELLED: return 4;
      case SessionState.ARCHIVED: return 5;
      case SessionState.READY: return 6;
      default: return 0;
    }
  }

  /**
   * API session'ını local session formatına çevirir
   */
  private static convertAPISessionToLocalSession(apiSession: any): PomodoroSession {
    return {
      id: apiSession.id,
      title: apiSession.title,
      sessionType: typeof apiSession.sessionType === 'string' ? 
        this.getSessionTypeNumber(apiSession.sessionType) : apiSession.sessionType,
      plannedDurationMinutes: apiSession.plannedDurationMinutes,
      actualDurationMinutes: apiSession.actualDurationMinutes,
      startTime: apiSession.startTime,
      endTime: apiSession.endTime,
      state: typeof apiSession.state === 'string' ? 
        this.getSessionStateNumber(apiSession.state) : apiSession.state,
      taskId: apiSession.taskId,
      categoryId: apiSession.categoryId,
      description: apiSession.description,
      notes: apiSession.notes
    };
  }

  /**
   * String session type'ını number'a çevirir
   */
  private static getSessionTypeNumber(sessionType: string): number {
    switch (sessionType) {
      case 'work': return 0;
      case 'short_break': return 1;
      case 'long_break': return 2;
      default: return 0;
    }
  }
}
