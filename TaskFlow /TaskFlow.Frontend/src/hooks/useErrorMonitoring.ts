/**
 * useErrorMonitoring Custom Hook
 *
 * Bu dosya, TaskFlow uygulamasında hata izleme ve
 * raporlama için kullanılan error monitoring hook'unu içerir.
 * JavaScript hatalarını, network hatalarını ve
 * kullanıcı deneyimi hatalarını yakalar.
 *
 * Ana Özellikler:
 * - Global error handling
 * - Network error monitoring
 * - React error boundaries
 * - Performance error tracking
 * - User feedback collection
 * - Error categorization
 *
 * Error Types:
 * - JavaScript errors
 * - Network errors
 * - React component errors
 * - Performance errors
 * - User interaction errors
 * - API errors
 *
 * Error Handling:
 * - Automatic error capture
 * - Error grouping
 * - Severity classification
 * - Context preservation
 * - User impact assessment
 * - Recovery suggestions
 *
 * Performance:
 * - Efficient error processing
 * - Batch error reporting
 * - Minimal performance impact
 * - Background processing
 * - Error deduplication
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * - Açık ve anlaşılır kod
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Error Severity Levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error Categories
 */
export type ErrorCategory = 
  | 'javascript'
  | 'network'
  | 'react'
  | 'api'
  | 'performance'
  | 'user_interaction'
  | 'authentication'
  | 'validation'
  | 'unknown';

/**
 * Error Context Interface
 */
export interface ErrorContext {
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
  stackTrace?: string;
  userActions?: string[];
  performanceMetrics?: Record<string, any>;
  networkInfo?: {
    online: boolean;
    connectionType?: string | null;
    effectiveType?: string | null;
  };
}

/**
 * Error Report Interface
 */
export interface ErrorReport {
  id: string;
  message: string;
  name: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  fingerprint: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  resolved: boolean;
  userImpact: 'none' | 'low' | 'medium' | 'high';
  recoverySuggestion?: string;
}

/**
 * Error Monitoring Configuration
 */
export interface ErrorMonitoringConfig {
  enabled: boolean;
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  maxErrorsPerMinute: number;
  captureUserActions: boolean;
  capturePerformance: boolean;
  captureNetworkInfo: boolean;
  debug: boolean;
  ignorePatterns: RegExp[];
  severityThreshold: ErrorSeverity;
}

/**
 * Error Monitoring State
 */
export interface ErrorMonitoringState {
  errors: ErrorReport[];
  isInitialized: boolean;
  config: ErrorMonitoringConfig;
  errorCount: number;
  lastErrorTime: number;
}

/**
 * useErrorMonitoring Custom Hook
 *
 * Hata izleme ve raporlama için kullanılan hook.
 * JavaScript hatalarını, network hatalarını ve React hatalarını yakalar.
 *
 * @param config - Error monitoring konfigürasyonu
 * @returns Error monitoring functions ve state
 */
export function useErrorMonitoring(config: Partial<ErrorMonitoringConfig> = {}) {
  const [state, setState] = useState<ErrorMonitoringState>({
    errors: [],
    isInitialized: false,
    config: {
      enabled: true,
      endpoint: '/api/errors',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxErrorsPerMinute: 10,
      captureUserActions: true,
      capturePerformance: true,
      captureNetworkInfo: true,
      debug: false,
      ignorePatterns: [
        /Script error\.?/, // Cross-origin script errors
        /ResizeObserver loop limit exceeded/, // Common browser warning
        /Network request failed/ // Network errors handled separately
      ],
      severityThreshold: 'low',
      ...config
    },
    errorCount: 0,
    lastErrorTime: 0
  });

  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const userActionsRef = useRef<string[]>([]);
  const errorFingerprintsRef = useRef<Map<string, ErrorReport>>(new Map());

  /**
   * Generate error fingerprint
   */
  const generateFingerprint = useCallback((error: Error, context: ErrorContext): string => {
    const key = `${error.name}:${error.message}:${context.url}`;
    return btoa(key).substring(0, 16);
  }, []);

  /**
   * Determine error severity
   */
  const determineSeverity = useCallback((error: Error, context: ErrorContext): ErrorSeverity => {
    // Critical errors
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'critical';
    }

    // High severity errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'high';
    }

    // Medium severity errors
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return 'medium';
    }

    // Low severity errors
    return 'low';
  }, []);

  /**
   * Determine error category
   */
  const determineCategory = useCallback((error: Error, context: ErrorContext): ErrorCategory => {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'network';
    }

    if (error.name === 'ValidationError') {
      return 'validation';
    }

    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      return 'authentication';
    }

    if (error.message.includes('performance') || error.message.includes('timeout')) {
      return 'performance';
    }

    if (context.componentStack) {
      return 'react';
    }

    return 'javascript';
  }, []);

  /**
   * Assess user impact
   */
  const assessUserImpact = useCallback((error: Error, severity: ErrorSeverity): 'none' | 'low' | 'medium' | 'high' => {
    if (severity === 'critical') {
      return 'high';
    }

    if (severity === 'high') {
      return 'medium';
    }

    if (severity === 'medium') {
      return 'low';
    }

    return 'none';
  }, []);

  /**
   * Generate recovery suggestion
   */
  const generateRecoverySuggestion = useCallback((error: Error, category: ErrorCategory): string | undefined => {
    switch (category) {
      case 'network':
        return 'İnternet bağlantınızı kontrol edin ve sayfayı yenileyin';
      case 'authentication':
        return 'Oturumunuzu yeniden açın';
      case 'validation':
        return 'Girdiğiniz bilgileri kontrol edin';
      case 'performance':
        return 'Sayfayı yenileyin veya daha sonra tekrar deneyin';
      default:
        return 'Sayfayı yenileyin';
    }
  }, []);

  /**
   * Capture error context
   */
  const captureContext = useCallback((): ErrorContext => {
    const context: ErrorContext = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      userActions: state.config.captureUserActions ? [...userActionsRef.current] : undefined,
      performanceMetrics: state.config.capturePerformance ? {
        memory: (performance as any).memory,
        navigation: performance.getEntriesByType('navigation')[0],
        paint: performance.getEntriesByType('paint')
      } : undefined,
      networkInfo: state.config.captureNetworkInfo ? {
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || undefined,
        effectiveType: (navigator as any).connection?.effectiveType || undefined
      } : undefined
    };

    return context;
  }, [state.config]);

  /**
   * Create error report
   */
  const createErrorReport = useCallback((error: Error, context: ErrorContext): ErrorReport => {
    const fingerprint = generateFingerprint(error, context);
    const severity = determineSeverity(error, context);
    const category = determineCategory(error, context);
    const userImpact = assessUserImpact(error, severity);
    const recoverySuggestion = generateRecoverySuggestion(error, category);

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      name: error.name,
      severity,
      category,
      context,
      fingerprint,
      occurrences: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      resolved: false,
      userImpact,
      recoverySuggestion
    };
  }, [generateFingerprint, determineSeverity, determineCategory, assessUserImpact, generateRecoverySuggestion]);

  /**
   * Check if error should be ignored
   */
  const shouldIgnoreError = useCallback((error: Error): boolean => {
    return state.config.ignorePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }, [state.config.ignorePatterns]);

  /**
   * Check rate limiting
   */
  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (state.lastErrorTime > oneMinuteAgo && state.errorCount >= state.config.maxErrorsPerMinute) {
      return true;
    }

    return false;
  }, [state.lastErrorTime, state.errorCount, state.config.maxErrorsPerMinute]);

  /**
   * Capture error
   */
  const captureError = useCallback((error: Error, additionalContext?: Partial<ErrorContext>) => {
    if (!state.config.enabled || shouldIgnoreError(error) || isRateLimited()) {
      return;
    }

    const context = {
      ...captureContext(),
      ...additionalContext
    };

    const errorReport = createErrorReport(error, context);
    const fingerprint = errorReport.fingerprint;

    // Check if we've seen this error before
    const existingError = errorFingerprintsRef.current.get(fingerprint);
    if (existingError) {
      // Update existing error
      existingError.occurrences += 1;
      existingError.lastSeen = Date.now();
      
      setState(prev => ({
        ...prev,
        errors: prev.errors.map(e => 
          e.fingerprint === fingerprint ? existingError : e
        ),
        errorCount: prev.errorCount + 1,
        lastErrorTime: Date.now()
      }));
    } else {
      // Add new error
      errorFingerprintsRef.current.set(fingerprint, errorReport);
      
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, errorReport],
        errorCount: prev.errorCount + 1,
        lastErrorTime: Date.now()
      }));
    }

    if (state.config.debug) {
      console.error('🚨 Error captured:', errorReport);
    }
  }, [state.config, shouldIgnoreError, isRateLimited, captureContext, createErrorReport]);

  /**
   * Capture React error
   */
  const captureReactError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    captureError(error, {
      componentStack: errorInfo.componentStack
    });
  }, [captureError]);

  /**
   * Capture network error
   */
  const captureNetworkError = useCallback((url: string, status: number, statusText: string) => {
    const error = new Error(`Network error: ${status} ${statusText}`);
    error.name = 'NetworkError';
    
    captureError(error, {
      url,
      networkInfo: {
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || undefined,
        effectiveType: (navigator as any).connection?.effectiveType || undefined
      }
    });
  }, [captureError]);

  /**
   * Track user action
   */
  const trackUserAction = useCallback((action: string) => {
    if (!state.config.captureUserActions) return;

    userActionsRef.current.push(`${action}:${Date.now()}`);
    
    // Keep only last 10 actions
    if (userActionsRef.current.length > 10) {
      userActionsRef.current = userActionsRef.current.slice(-10);
    }
  }, [state.config.captureUserActions]);

  /**
   * Flush errors to server
   */
  const flushErrors = useCallback(async () => {
    if (state.errors.length === 0) return;

    try {
      const errorsToSend = state.errors.filter(error => 
        !error.resolved && 
        Date.now() - error.lastSeen > 5000 // Only send errors older than 5 seconds
      );

      if (errorsToSend.length === 0) return;

      setState(prev => ({
        ...prev,
        errors: prev.errors.filter(error => 
          error.resolved || Date.now() - error.lastSeen <= 5000
        )
      }));

      // Send to error monitoring endpoint
      await fetch(state.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now()
        })
      });

      if (state.config.debug) {
        console.log('🚨 Errors flushed:', errorsToSend.length);
      }
    } catch (error) {
      console.error('Error monitoring flush error:', error);
    }
  }, [state.errors, state.config]);

  /**
   * Initialize error monitoring
   */
  const initialize = useCallback(() => {
    if (state.isInitialized) return;

    // Global error handlers
    const handleGlobalError = (event: ErrorEvent) => {
      captureError(event.error || new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(new Error(event.reason));
    };

    // Network error monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          captureNetworkError(args[0] as string, response.status, response.statusText);
        }
        
        return response;
      } catch (error) {
        captureNetworkError(args[0] as string, 0, 'Network Error');
        throw error;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Set up periodic flush
    flushTimeoutRef.current = setInterval(flushErrors, state.config.flushInterval);

    setState(prev => ({
      ...prev,
      isInitialized: true
    }));

    if (state.config.debug) {
      console.log('🚨 Error monitoring initialized');
    }

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch;
      
      if (flushTimeoutRef.current) {
        clearInterval(flushTimeoutRef.current);
      }
    };
  }, [state.isInitialized, captureError, captureNetworkError, flushErrors, state.config]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return {
    // State
    errors: state.errors,
    isInitialized: state.isInitialized,
    config: state.config,
    errorCount: state.errorCount,

    // Actions
    captureError,
    captureReactError,
    captureNetworkError,
    trackUserAction,
    flushErrors
  };
} 