/**
 * Session Validation Utility
 * 
 * Session verilerinin doğruluğunu kontrol eder
 */

import type { PomodoroSession } from '../../../services/api/pomodoroAPI';
import { SessionType, SessionPriority } from '../types/pomodoro.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CreateSessionValidationData {
  title: string;
  sessionType: number;
  duration: number;
  description?: string;
  notes?: string;
  taskId?: number;
  categoryId?: number;
}

/**
 * Session Validation Service
 */
export class SessionValidator {
  /**
   * Session oluşturma verilerini validate eder
   */
  static validateCreateSession(data: CreateSessionValidationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Session başlığı gereklidir');
    } else if (data.title.trim().length < 3) {
      errors.push('Session başlığı en az 3 karakter olmalıdır');
    } else if (data.title.trim().length > 100) {
      errors.push('Session başlığı en fazla 100 karakter olabilir');
    }

    // Session type validation
    if (data.sessionType < 0 || data.sessionType > 2) {
      errors.push('Geçersiz session tipi');
    }

    // Duration validation
    if (data.duration < 1) {
      errors.push('Session süresi en az 1 dakika olmalıdır');
    } else if (data.duration > 480) {
      errors.push('Session süresi en fazla 480 dakika (8 saat) olabilir');
    } else if (data.duration > 120) {
      warnings.push('Uzun session süresi (2 saatten fazla) önerilmez');
    }

    // Description validation
    if (data.description && data.description.length > 500) {
      errors.push('Açıklama en fazla 500 karakter olabilir');
    }

    // Notes validation
    if (data.notes && data.notes.length > 1000) {
      errors.push('Notlar en fazla 1000 karakter olabilir');
    }

    // Business rule validations
    if (data.sessionType === 0 && data.duration < 15) {
      warnings.push('Calisma sessionlari icin en az 15 dakika onerilir');
    }

    if (data.sessionType === 1 && data.duration > 15) {
      warnings.push('Kisa mola icin 15 dakikadan fazla onerilmez');
    }

    if (data.sessionType === 2 && data.duration < 15) {
      warnings.push('Uzun mola icin en az 15 dakika onerilir');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Session güncelleme verilerini validate eder
   */
  static validateUpdateSession(data: Partial<CreateSessionValidationData>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation (if provided)
    if (data.title !== undefined) {
          if (data.title.trim().length === 0) {
      errors.push('Session basligi bos olamaz');
    } else if (data.title.trim().length < 3) {
      errors.push('Session basligi en az 3 karakter olmalidir');
    } else if (data.title.trim().length > 100) {
      errors.push('Session basligi en fazla 100 karakter olabilir');
    }
    }

    // Duration validation (if provided)
    if (data.duration !== undefined) {
          if (data.duration < 1) {
      errors.push('Session suresi en az 1 dakika olmalidir');
    } else if (data.duration > 480) {
      errors.push('Session suresi en fazla 480 dakika olabilir');
    }
    }

    // Description validation (if provided)
    if (data.description !== undefined && data.description.length > 500) {
      errors.push('Aciklama en fazla 500 karakter olabilir');
    }

    // Notes validation (if provided)
    if (data.notes !== undefined && data.notes.length > 1000) {
      errors.push('Notlar en fazla 1000 karakter olabilir');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Session'ın geçerli olup olmadığını kontrol eder
   */
  static validateSession(session: PomodoroSession): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!session.title || session.title.trim().length === 0) {
      errors.push('Session basligi gereklidir');
    }

    if (!session.sessionType) {
      errors.push('Session tipi gereklidir');
    }

    if (!session.plannedDurationMinutes || session.plannedDurationMinutes < 1) {
      errors.push('Gecerli session suresi gereklidir');
    }

    // Business logic validations
    if (session.state === 'active' && !session.startedAt) {
      errors.push('Aktif sessionin baslangic zamani olmalidir');
    }

    if (session.state === 'completed' && !session.completedAt) {
      errors.push('Tamamlanmis sessionin bitis zamani olmalidir');
    }

    if (session.actualDurationMinutes && session.actualDurationMinutes < 0) {
      errors.push('Gercek sure negatif olamaz');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Session'ın başlatılabilir olup olmadığını kontrol eder
   */
  static canStartSession(session: PomodoroSession): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // State validation
    if (session.state === 'active') {
      errors.push('Session zaten aktif');
    }

    if (session.state === 'completed') {
      errors.push('Tamamlanmis session baslatilamaz');
    }

    if (session.state === 'cancelled') {
      errors.push('Iptal edilmis session baslatilamaz');
    }

    // Duration validation
    if (session.plannedDurationMinutes < 1) {
      errors.push('Gecersiz session suresi');
    }

    // Time validation
    if (session.scheduledStartTime && new Date(session.scheduledStartTime) > new Date()) {
      warnings.push('Session henuz planlanmis zamanda degil');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Session'ın duraklatılabilir olup olmadığını kontrol eder
   */
  static canPauseSession(session: PomodoroSession): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (session.state !== 'active') {
      errors.push('Sadece aktif sessionlar duraklatilabilir');
    }

    if (session.state === 'paused') {
      errors.push('Session zaten duraklatilmis');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Session'ın tamamlanabilir olup olmadığını kontrol eder
   */
  static canCompleteSession(session: PomodoroSession): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (session.state === 'completed') {
      errors.push('Session zaten tamamlanmış');
    }

    if (session.state === 'cancelled') {
      errors.push('Iptal edilmis session tamamlanamaz');
    }

    if (session.state === 'draft') {
      errors.push('Taslak session tamamlanamaz');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validation mesajlarını formatlar
   */
  static formatValidationMessages(result: ValidationResult): string {
    const messages: string[] = [];

    if (result.errors.length > 0) {
      messages.push('Hatalar:');
      messages.push(...result.errors.map(error => `• ${error}`));
    }

    if (result.warnings.length > 0) {
      messages.push('Uyarilar:');
      messages.push(...result.warnings.map(warning => `• ${warning}`));
    }

    return messages.join('\n');
  }
}

