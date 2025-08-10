/**
 * Error Recovery Utility
 * 
 * Session işlemlerindeki hataları yönetir ve kurtarma stratejileri uygular
 */

import { pomodoroAPI } from '../../../services/api/pomodoroAPI';
import type { PomodoroSession } from '../../../services/api/pomodoroAPI';

export interface ErrorContext {
  operation: string;
  sessionId?: number;
  session?: PomodoroSession;
  retryCount: number;
  maxRetries: number;
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: any, context: ErrorContext) => boolean;
  action: (error: any, context: ErrorContext) => Promise<boolean>;
  priority: number;
}

/**
 * Error Recovery Service
 */
export class SessionErrorRecovery {
  private static strategies: RecoveryStrategy[] = [];

  /**
   * Recovery stratejilerini kaydeder
   */
  static registerStrategy(strategy: RecoveryStrategy) {
    this.strategies.push(strategy);
    // Priority'ye göre sırala
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Hata durumunu analiz eder ve uygun kurtarma stratejisini uygular
   */
  static async handleError(error: any, context: ErrorContext): Promise<boolean> {
    console.error(`❌ Error in ${context.operation}:`, error);
    
    // Hata türünü belirle
    const errorType = this.determineErrorType(error);
    
    // Uygun stratejiyi bul
    const strategy = this.findStrategy(errorType, context);
    
    if (strategy) {
      console.log(`🔄 Applying recovery strategy: ${strategy.name}`);
      
      try {
        const success = await strategy.action(error, context);
        
        if (success) {
          console.log(`Hata kurtarıldı: ${strategy.name}`);
          return true;
        } else {
          console.error(`Kurtarma başarısız: ${strategy.name}`);
          return false;
        }
      } catch (recoveryError) {
        console.error('Recovery strategy failed:', recoveryError);
        console.error('Kurtarma stratejisi başarısız');
        return false;
      }
    }
    
    // Strateji bulunamadıysa genel hata mesajı göster
    this.showGenericError(error, context);
    return false;
  }

  /**
   * Hata türünü belirler
   */
  private static determineErrorType(error: any): string {
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          return 'VALIDATION_ERROR';
        case 401:
          return 'AUTHENTICATION_ERROR';
        case 403:
          return 'AUTHORIZATION_ERROR';
        case 404:
          return 'NOT_FOUND_ERROR';
        case 409:
          return 'CONFLICT_ERROR';
        case 422:
          return 'UNPROCESSABLE_ENTITY_ERROR';
        case 429:
          return 'RATE_LIMIT_ERROR';
        case 500:
          return 'SERVER_ERROR';
        case 502:
        case 503:
        case 504:
          return 'SERVICE_UNAVAILABLE_ERROR';
        default:
          return 'HTTP_ERROR';
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'NETWORK_ERROR';
    }
    
    if (error.code === 'TIMEOUT_ERROR') {
      return 'TIMEOUT_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Uygun kurtarma stratejisini bulur
   */
  private static findStrategy(errorType: string, context: ErrorContext): RecoveryStrategy | null {
    return this.strategies.find(strategy => 
      strategy.condition({ type: errorType }, context)
    ) || null;
  }

  /**
   * Genel hata mesajını gösterir
   */
  private static showGenericError(error: any, context: ErrorContext) {
    const errorMessage = this.getUserFriendlyMessage(error, context);
    console.error(errorMessage);
  }

  /**
   * Kullanıcı dostu hata mesajı oluşturur
   */
  private static getUserFriendlyMessage(error: any, context: ErrorContext): string {
    const operation = this.getOperationLabel(context.operation);
    
    if (error.response?.status === 400) {
      return `${operation} için geçersiz veri. Lütfen bilgilerinizi kontrol edin.`;
    }
    
    if (error.response?.status === 401) {
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    }
    
    if (error.response?.status === 403) {
      return 'Bu işlem için yetkiniz bulunmuyor.';
    }
    
    if (error.response?.status === 404) {
      return `${operation} bulunamadı.`;
    }
    
    if (error.response?.status === 409) {
      return `${operation} çakışması oluştu. Lütfen tekrar deneyin.`;
    }
    
    if (error.response?.status === 429) {
      return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
    }
    
    if (error.response?.status >= 500) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'İnternet bağlantınızı kontrol edin.';
    }
    
    if (error.code === 'TIMEOUT_ERROR') {
      return 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
    }
    
    return `${operation} sırasında bir hata oluştu.`;
  }

  /**
   * İşlem etiketini döndürür
   */
  private static getOperationLabel(operation: string): string {
    const labels: Record<string, string> = {
      'startSession': 'Session başlatma',
      'pauseSession': 'Session duraklatma',
      'resumeSession': 'Session devam ettirme',
      'completeSession': 'Session tamamlama',
      'cancelSession': 'Session iptal etme',
      'deleteSession': 'Session silme',
      'createSession': 'Session oluşturma',
      'updateSession': 'Session güncelleme',
      'loadSessions': 'Session yükleme'
    };
    
    return labels[operation] || operation;
  }

  /**
   * Retry mekanizması
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for ${context.operation}`);
          
          // Exponential backoff
          const waitTime = delay * Math.pow(2, attempt - 1);
          await this.delay(waitTime);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Varsayılan kurtarma stratejilerini kaydet
SessionErrorRecovery.registerStrategy({
  name: 'Network Retry',
  condition: (error) => error.type === 'NETWORK_ERROR',
  action: async (error, context) => {
    if (context.retryCount < context.maxRetries) {
      await SessionErrorRecovery.delay(1000 * (context.retryCount + 1));
      return true; // Retry yapılacak
    }
    return false;
  },
  priority: 10
});

SessionErrorRecovery.registerStrategy({
  name: 'Session Conflict Resolution',
  condition: (error) => error.type === 'CONFLICT_ERROR',
  action: async (error, context) => {
    // Conflict resolution logic
    if (context.session) {
      try {
        // Session'ı yeniden yükle ve durumu kontrol et
        const updatedSession = await pomodoroAPI.getSession(context.session.id!);
        
        if (updatedSession.state !== context.session.state) {
          // State değişmiş, conflict çözülmüş
          return true;
        }
      } catch (reloadError) {
        console.error('Session reload failed:', reloadError);
      }
    }
    return false;
  },
  priority: 8
});

SessionErrorRecovery.registerStrategy({
  name: 'Authentication Refresh',
  condition: (error) => error.type === 'AUTHENTICATION_ERROR',
  action: async (error, context) => {
    // Token refresh logic burada olacak
    // Şimdilik false döndür
    return false;
  },
  priority: 9
});

SessionErrorRecovery.registerStrategy({
  name: 'Rate Limit Wait',
  condition: (error) => error.type === 'RATE_LIMIT_ERROR',
  action: async (error, context) => {
    // Rate limit için bekle
    await SessionErrorRecovery.delay(5000);
    return true;
  },
  priority: 7
});

