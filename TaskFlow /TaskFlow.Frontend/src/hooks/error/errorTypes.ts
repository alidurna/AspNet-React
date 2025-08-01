/**
 * Error Monitoring Types
 * 
 * Error monitoring için kullanılan type definitions ve interfaces.
 */

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
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  resolved: boolean;
  tags?: string[];
}

/**
 * Error Statistics Interface
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorRate: number;
  averageResolutionTime: number;
  topErrors: ErrorReport[];
}

/**
 * Error Monitoring Config
 */
export interface ErrorMonitoringConfig {
  enabled: boolean;
  maxErrors: number;
  reportInterval: number;
  captureConsoleErrors: boolean;
  captureUnhandledRejections: boolean;
  captureNetworkErrors: boolean;
  severityThresholds: {
    javascript: ErrorSeverity;
    network: ErrorSeverity;
    api: ErrorSeverity;
  };
}

/**
 * Network Error Info
 */
export interface NetworkErrorInfo {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
}

/**
 * Performance Error Info
 */
export interface PerformanceErrorInfo {
  metric: string;
  value: number;
  threshold: number;
  impact: 'low' | 'medium' | 'high';
}

/**
 * User Action Info
 */
export interface UserActionInfo {
  action: string;
  element?: string;
  timestamp: number;
  data?: Record<string, any>;
} 