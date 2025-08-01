/**
 * useErrorMonitoring Custom Hook - Refactored
 *
 * Modüler error monitoring hook'u. Büyük monolitik yapı yerine
 * küçük, focused utilities kullanır.
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import type { 
  ErrorReport, 
  ErrorStats, 
  ErrorMonitoringConfig,
  NetworkErrorInfo,
  PerformanceErrorInfo 
} from './error/errorTypes';
import { 
  createErrorReport, 
  createNetworkErrorReport, 
  createPerformanceErrorReport 
} from './error/errorCapture';

/**
 * Default configuration
 */
const defaultConfig: ErrorMonitoringConfig = {
  enabled: true,
  maxErrors: 100,
  reportInterval: 60000, // 1 minute
  captureConsoleErrors: true,
  captureUnhandledRejections: true,
  captureNetworkErrors: true,
  severityThresholds: {
    javascript: 'medium',
    network: 'high',
    api: 'medium'
  }
};

/**
 * useErrorMonitoring Hook - Refactored
 * 
 * Ana error monitoring hook'u. Modüler utilities kullanarak
 * error capture, reporting ve statistics sağlar.
 */
export const useErrorMonitoring = (config: Partial<ErrorMonitoringConfig> = {}) => {
  // ===== CONFIG =====
  const finalConfig = { ...defaultConfig, ...config };
  
  // ===== STATE =====
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  
  // ===== REFS =====
  const errorQueue = useRef<ErrorReport[]>([]);
  const reportTimer = useRef<NodeJS.Timeout | null>(null);

  // ===== ERROR HANDLERS =====
  /**
   * Handle JavaScript errors
   */
  const handleJavaScriptError = useCallback((event: ErrorEvent) => {
    if (!finalConfig.enabled) return;

    const error = new Error(event.message);
    error.name = 'JavaScriptError';
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`;

    const errorReport = createErrorReport(error, {
      componentStack: event.filename
    });

    addError(errorReport);
  }, [finalConfig.enabled]);

  /**
   * Handle unhandled promise rejections
   */
  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    if (!finalConfig.enabled) return;

    const error = new Error(String(event.reason));
    error.name = 'UnhandledRejection';

    const errorReport = createErrorReport(error);
    addError(errorReport);
  }, [finalConfig.enabled]);

  /**
   * Add error to queue and state
   */
  const addError = useCallback((errorReport: ErrorReport) => {
    // Check for duplicates
    const existingError = errors.find(e => 
      e.message === errorReport.message && 
      e.name === errorReport.name
    );

    if (existingError) {
      // Update existing error
      setErrors(prev => prev.map(e => 
        e.id === existingError.id 
          ? { ...e, count: e.count + 1, lastOccurrence: Date.now() }
          : e
      ));
    } else {
      // Add new error
      setErrors(prev => {
        const newErrors = [...prev, errorReport];
        
        // Limit max errors
        if (newErrors.length > finalConfig.maxErrors) {
          return newErrors.slice(-finalConfig.maxErrors);
        }
        
        return newErrors;
      });
    }

    // Add to queue for reporting
    errorQueue.current.push(errorReport);
  }, [errors, finalConfig.maxErrors]);

  // ===== STATISTICS =====
  /**
   * Calculate error statistics
   */
  const calculateStats = useCallback((): ErrorStats => {
    const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
    
    const errorsByCategory = errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + error.count;
      return acc;
    }, {} as Record<string, number>);

    const errorsBySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + error.count;
      return acc;
    }, {} as Record<string, number>);

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentErrors = errors.filter(error => error.lastOccurrence > oneHourAgo);
    const errorRate = recentErrors.length / 60; // errors per minute

    const topErrors = [...errors]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByCategory: errorsByCategory as any,
      errorsBySeverity: errorsBySeverity as any,
      errorRate,
      averageResolutionTime: 0, // TODO: Calculate when resolution tracking is implemented
      topErrors
    };
  }, [errors]);

  // ===== REPORTING =====
  /**
   * Report errors to backend (mock implementation)
   */
  const reportErrors = useCallback(async () => {
    if (errorQueue.current.length === 0) return;

    try {
      // Mock API call - replace with real implementation
      console.log('Reporting errors:', errorQueue.current);
      
      // Clear queue after successful report
      errorQueue.current = [];
    } catch (error) {
      console.error('Failed to report errors:', error);
    }
  }, []);

  // ===== PUBLIC METHODS =====
  /**
   * Manually capture an error
   */
  const captureError = useCallback((error: Error | any, additionalContext?: any) => {
    if (!finalConfig.enabled) return;

    const errorReport = createErrorReport(error, additionalContext);
    addError(errorReport);
  }, [finalConfig.enabled, addError]);

  /**
   * Capture network error
   */
  const captureNetworkError = useCallback((networkInfo: NetworkErrorInfo) => {
    if (!finalConfig.enabled || !finalConfig.captureNetworkErrors) return;

    const errorReport = createNetworkErrorReport(networkInfo);
    addError(errorReport);
  }, [finalConfig.enabled, finalConfig.captureNetworkErrors, addError]);

  /**
   * Capture performance error
   */
  const capturePerformanceError = useCallback((performanceInfo: PerformanceErrorInfo) => {
    if (!finalConfig.enabled) return;

    const errorReport = createPerformanceErrorReport(performanceInfo);
    addError(errorReport);
  }, [finalConfig.enabled, addError]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    errorQueue.current = [];
  }, []);

  /**
   * Mark error as resolved
   */
  const resolveError = useCallback((errorId: string) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId ? { ...error, resolved: true } : error
    ));
  }, []);

  // ===== EFFECTS =====
  /**
   * Setup error monitoring
   */
  useEffect(() => {
    if (!finalConfig.enabled) {
      setIsMonitoring(false);
      return;
    }

    // Setup global error handlers
    if (finalConfig.captureConsoleErrors) {
      window.addEventListener('error', handleJavaScriptError);
    }

    if (finalConfig.captureUnhandledRejections) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    setIsMonitoring(true);

    // Setup reporting interval
    reportTimer.current = setInterval(reportErrors, finalConfig.reportInterval);

    return () => {
      window.removeEventListener('error', handleJavaScriptError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      
      if (reportTimer.current) {
        clearInterval(reportTimer.current);
      }
      
      setIsMonitoring(false);
    };
  }, [
    finalConfig.enabled,
    finalConfig.captureConsoleErrors,
    finalConfig.captureUnhandledRejections,
    finalConfig.reportInterval,
    handleJavaScriptError,
    handleUnhandledRejection,
    reportErrors
  ]);

  /**
   * Update statistics when errors change
   */
  useEffect(() => {
    const newStats = calculateStats();
    setStats(newStats);
  }, [errors, calculateStats]);

  // ===== RETURN =====
  return {
    // Core data
    errors,
    stats,
    isMonitoring,
    
    // Configuration
    config: finalConfig,
    
    // Methods
    captureError,
    captureNetworkError,
    capturePerformanceError,
    clearErrors,
    resolveError,
    reportErrors,
    
    // Computed values
    errorCount: errors.length,
    hasErrors: errors.length > 0,
    criticalErrors: errors.filter(e => e.severity === 'critical'),
    recentErrors: errors.filter(e => Date.now() - e.lastOccurrence < 300000) // Last 5 minutes
  };
};

export default useErrorMonitoring; 