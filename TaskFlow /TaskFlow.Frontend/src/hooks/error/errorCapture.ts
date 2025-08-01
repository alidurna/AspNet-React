/**
 * Error Capture Utilities
 * 
 * Error yakalama ve context toplama utilities.
 */

import type { 
  ErrorReport, 
  ErrorContext, 
  ErrorCategory, 
  ErrorSeverity,
  NetworkErrorInfo,
  PerformanceErrorInfo 
} from './errorTypes';

/**
 * Generate unique error ID
 */
export const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current error context
 */
export const getErrorContext = (): ErrorContext => {
  const now = Date.now();
  
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: now,
    userId: localStorage.getItem('user_id') || undefined,
    sessionId: sessionStorage.getItem('session_id') || generateSessionId(),
    networkInfo: getNetworkInfo()
  };
};

/**
 * Generate session ID
 */
const generateSessionId = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
};

/**
 * Get network information
 */
const getNetworkInfo = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    connectionType: connection?.type || null,
    effectiveType: connection?.effectiveType || null
  };
};

/**
 * Categorize error based on error object
 */
export const categorizeError = (error: Error | any): ErrorCategory => {
  const message = error?.message?.toLowerCase() || '';
  const name = error?.name?.toLowerCase() || '';
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || name.includes('networkerror')) {
    return 'network';
  }
  
  // API errors
  if (message.includes('api') || message.includes('response') || message.includes('request')) {
    return 'api';
  }
  
  // React errors
  if (message.includes('react') || name.includes('invariant')) {
    return 'react';
  }
  
  // Performance errors
  if (message.includes('performance') || message.includes('timeout')) {
    return 'performance';
  }
  
  // Authentication errors
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'authentication';
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  
  // Default to javascript
  return 'javascript';
};

/**
 * Determine error severity
 */
export const determineSeverity = (error: Error | any, category: ErrorCategory): ErrorSeverity => {
  const message = error?.message?.toLowerCase() || '';
  
  // Critical errors
  if (message.includes('critical') || message.includes('fatal') || category === 'authentication') {
    return 'critical';
  }
  
  // High severity errors
  if (message.includes('error') || category === 'network' || category === 'api') {
    return 'high';
  }
  
  // Medium severity errors
  if (message.includes('warning') || category === 'validation' || category === 'performance') {
    return 'medium';
  }
  
  // Default to low
  return 'low';
};

/**
 * Extract stack trace
 */
export const extractStackTrace = (error: Error): string | undefined => {
  if (error.stack) {
    // Clean up stack trace
    return error.stack
      .split('\n')
      .slice(0, 10) // Limit to first 10 lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
  return undefined;
};

/**
 * Create error report from error object
 */
export const createErrorReport = (
  error: Error | any, 
  additionalContext?: Partial<ErrorContext>
): ErrorReport => {
  const category = categorizeError(error);
  const severity = determineSeverity(error, category);
  const context = { ...getErrorContext(), ...additionalContext };
  const stackTrace = extractStackTrace(error);
  
  if (stackTrace) {
    context.stackTrace = stackTrace;
  }
  
  return {
    id: generateErrorId(),
    message: error?.message || 'Unknown error',
    name: error?.name || 'Error',
    severity,
    category,
    context,
    count: 1,
    firstOccurrence: Date.now(),
    lastOccurrence: Date.now(),
    resolved: false
  };
};

/**
 * Create network error report
 */
export const createNetworkErrorReport = (
  networkInfo: NetworkErrorInfo,
  additionalContext?: Partial<ErrorContext>
): ErrorReport => {
  const context = { ...getErrorContext(), ...additionalContext };
  
  return {
    id: generateErrorId(),
    message: `Network error: ${networkInfo.method} ${networkInfo.url} - ${networkInfo.status} ${networkInfo.statusText}`,
    name: 'NetworkError',
    severity: networkInfo.status && networkInfo.status >= 500 ? 'high' : 'medium',
    category: 'network',
    context,
    count: 1,
    firstOccurrence: Date.now(),
    lastOccurrence: Date.now(),
    resolved: false
  };
};

/**
 * Create performance error report
 */
export const createPerformanceErrorReport = (
  performanceInfo: PerformanceErrorInfo,
  additionalContext?: Partial<ErrorContext>
): ErrorReport => {
  const context = { ...getErrorContext(), ...additionalContext };
  
  return {
    id: generateErrorId(),
    message: `Performance issue: ${performanceInfo.metric} (${performanceInfo.value}) exceeded threshold (${performanceInfo.threshold})`,
    name: 'PerformanceError',
    severity: performanceInfo.impact === 'high' ? 'high' : performanceInfo.impact === 'medium' ? 'medium' : 'low',
    category: 'performance',
    context,
    count: 1,
    firstOccurrence: Date.now(),
    lastOccurrence: Date.now(),
    resolved: false
  };
}; 