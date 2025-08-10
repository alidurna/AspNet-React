/**
 * Session Conflict Resolution
 * 
 * Aktif session çakışmalarını yönetir
 */

import type { PomodoroSession } from '../../../services/api/pomodoroAPI';
import { pomodoroAPI } from '../../../services/api/pomodoroAPI';

/**
 * Conflict Resolution Service
 */
export class SessionConflictResolver {
  /**
   * Aktif session çakışmasını kontrol eder ve çözer
   */
  static async handleActiveSessionConflict(
    newSession: PomodoroSession,
    activeSession: PomodoroSession | null
  ): Promise<boolean> {
    if (!activeSession) return true;

    // Çakışma türünü belirle
    const conflictType = this.determineConflictType(newSession, activeSession);
    
    switch (conflictType) {
      case 'SAME_TYPE':
        return await this.handleSameTypeConflict(newSession, activeSession);
      
      case 'DIFFERENT_TYPE':
        return await this.handleDifferentTypeConflict(newSession, activeSession);
      
      case 'SCHEDULED':
        return await this.handleScheduledConflict(newSession, activeSession);
      
      default:
        return await this.handleGenericConflict(newSession, activeSession);
    }
  }

  /**
   * Çakışma türünü belirler
   */
  private static determineConflictType(
    newSession: PomodoroSession,
    activeSession: PomodoroSession
  ): 'SAME_TYPE' | 'DIFFERENT_TYPE' | 'SCHEDULED' | 'GENERIC' {
    if (newSession.sessionType === activeSession.sessionType) {
      return 'SAME_TYPE';
    }
    
    if (activeSession.state === 6) { // READY state
      return 'SCHEDULED';
    }
    
    return 'DIFFERENT_TYPE';
  }

  /**
   * Aynı tür session çakışmasını çözer
   */
  private static async handleSameTypeConflict(
    newSession: PomodoroSession,
    activeSession: PomodoroSession
  ): Promise<boolean> {
    const shouldOverride = window.confirm(
      `Zaten aktif bir ${this.getSessionTypeLabel(activeSession.sessionType)} sessioniniz var: "${activeSession.title}"\n\n` +
      'Yeni session baslatmak icin mevcut sessioni iptal etmek gerekiyor. Devam etmek istiyor musunuz?'
    );

    if (shouldOverride) {
      try {
        await pomodoroAPI.cancelSession(activeSession.id!);
        console.log('Aktif session iptal edildi');
        return true;
      } catch (error) {
        console.error('Session iptal edilemedi');
        return false;
      }
    }

    return false;
  }

  /**
   * Farklı tür session çakışmasını çözer
   */
  private static async handleDifferentTypeConflict(
    newSession: PomodoroSession,
    activeSession: PomodoroSession
  ): Promise<boolean> {
    const shouldOverride = window.confirm(
      `Aktif bir ${this.getSessionTypeLabel(activeSession.sessionType)} sessioniniz var: "${activeSession.title}"\n\n` +
      `Yeni ${this.getSessionTypeLabel(newSession.sessionType)} sessioni baslatmak icin mevcut sessioni iptal etmek gerekiyor. Devam etmek istiyor musunuz?`
    );

    if (shouldOverride) {
      try {
        await pomodoroAPI.cancelSession(activeSession.id!);
        console.log('Aktif session iptal edildi');
        return true;
      } catch (error) {
        console.error('Session iptal edilemedi');
        return false;
      }
    }

    return false;
  }

  /**
   * Planlanmış session çakışmasını çözer
   */
  private static async handleScheduledConflict(
    newSession: PomodoroSession,
    activeSession: PomodoroSession
  ): Promise<boolean> {
    const shouldSchedule = window.confirm(
      `Aktif bir sessioniniz var: "${activeSession.title}"\n\n` +
      `Yeni sessioni planlamak istiyor musunuz?`
    );

    if (shouldSchedule) {
      // Session'ı planlanmış olarak işaretle
      return true;
    }

    return false;
  }

  /**
   * Genel çakışma çözümü
   */
  private static async handleGenericConflict(
    newSession: PomodoroSession,
    activeSession: PomodoroSession
  ): Promise<boolean> {
    const shouldOverride = window.confirm(
      `Aktif bir sessioniniz var: "${activeSession.title}"\n\n` +
      'Yeni session baslatmak icin mevcut sessioni iptal etmek gerekiyor. Devam etmek istiyor musunuz?'
    );

    if (shouldOverride) {
      try {
        await pomodoroAPI.cancelSession(activeSession.id!);
        console.log('Aktif session iptal edildi');
        return true;
      } catch (error) {
        console.error('Session iptal edilemedi');
        return false;
      }
    }

    return false;
  }

  /**
   * Session tipini etiket olarak döndürür
   */
  private static getSessionTypeLabel(sessionType: number): string {
    switch (sessionType) {
      case 0:
        return 'Calisma';
      case 1:
        return 'Kisa Mola';
      case 2:
        return 'Uzun Mola';
      default:
        return 'Session';
    }
  }

  /**
   * Çoklu session çakışmasını çözer
   */
  static async handleMultipleSessionConflict(sessions: PomodoroSession[]): Promise<PomodoroSession[]> {
    const activeSessions = sessions.filter(s => s.state === 1); // ACTIVE state
    
    if (activeSessions.length <= 1) {
      return sessions;
    }

    // En son başlatılan session'ı aktif bırak, diğerlerini iptal et
    const sortedSessions = activeSessions.sort((a, b) => {
      const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
      return bTime - aTime;
    });

    const keepSession = sortedSessions[0];
    const cancelSessions = sortedSessions.slice(1);

    try {
      await Promise.all(cancelSessions.map(session => 
        pomodoroAPI.cancelSession(session.id!)
      ));
      
      console.log(`${cancelSessions.length} session iptal edildi`);
      
      return sessions.map(session => 
        cancelSessions.some(cs => cs.id === session.id) 
          ? { ...session, state: 4 } // CANCELLED state
          : session
      );
    } catch (error) {
      console.error('Sessionlar iptal edilemedi');
      return sessions;
    }
  }
}

