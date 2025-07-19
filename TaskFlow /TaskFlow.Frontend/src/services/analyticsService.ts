/**
 * Analytics Service
 * 
 * Bu dosya, TaskFlow uygulamasında analytics verilerini
 * yönetmek için kullanılan servis sınıfını içerir.
 * API çağrıları, veri işleme ve analytics fonksiyonlarını sağlar.
 * 
 * Ana Özellikler:
 * - Analytics event tracking
 * - User behavior analysis
 * - Performance monitoring
 * - Error reporting
 * - Real-time data streaming
 * - Advanced analytics features
 * 
 * API Endpoints:
 * - POST /api/analytics/events - Track events
 * - POST /api/analytics/sessions - Session management
 * - POST /api/analytics/errors - Error reporting
 * - POST /api/analytics/performance - Performance tracking
 * - GET /api/analytics/dashboard - Dashboard data
 * - POST /api/analytics/dashboard/connect - Real-time connection
 * - POST /api/analytics/dashboard/update - Real-time updates
 * - POST /api/analytics/stream - Analytics streaming
 * 
 * Advanced Features:
 * - User journey tracking
 * - Conversion funnel analysis
 * - A/B testing support
 * - Predictive analytics
 * - Custom event tracking
 * - Data export functionality
 * 
 * Performance:
 * - Efficient data processing
 * - Batch operations
 * - Caching strategies
 * - Real-time updates
 * - Offline support
 * 
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Error handling
 * - Logging ve monitoring
 * - Versioning support
 * - Documentation
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { tokenManager } from './api';

/**
 * Analytics Event Types
 */
export type AnalyticsEventType = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'task_created'
  | 'task_completed'
  | 'task_deleted'
  | 'search_performed'
  | 'filter_applied'
  | 'bulk_action'
  | 'error_occurred'
  | 'performance_metric'
  | 'user_action'
  | 'custom_event';

/**
 * Analytics Event Priority
 */
export type AnalyticsEventPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Analytics Event Interface
 */
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  eventName: string;
  sessionId: string;
  userId?: number;
  page: string;
  userAgent?: string;
  screenResolution?: string;
  language?: string;
  properties?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  location?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  referrer?: string;
  utmParameters?: Record<string, string>;
  duration?: number;
  isSuccessful: boolean;
  errorMessage?: string;
  fingerprint?: string;
  priority: AnalyticsEventPriority;
  tags?: string[];
}

/**
 * User Session Interface
 */
export interface UserSession {
  id: string;
  userId?: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  lastActivity: Date;
  pageViews: number;
  events: number;
  status: 'active' | 'ended' | 'abandoned';
  sessionType: 'web' | 'mobile' | 'desktop';
  isAuthenticated: boolean;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  language?: string;
  referrer?: string;
  utmParameters?: Record<string, string>;
  properties?: Record<string, any>;
  priority: AnalyticsEventPriority;
  isSuccessful: boolean;
  errorMessage?: string;
  tags?: string[];
}

/**
 * Error Report Interface
 */
export interface ErrorReport {
  message: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'react' | 'api' | 'database' | 'other';
  sessionId: string;
  userId?: number;
  url: string;
  fingerprint: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recoverySuggestion?: string;
  priority: AnalyticsEventPriority;
  isMonitored: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  context?: Record<string, any>;
  stackTrace?: string;
  componentStack?: string;
  userActions?: Record<string, any>;
  performanceMetrics?: Record<string, any>;
  networkInfo?: Record<string, any>;
  tags?: string[];
  properties?: Record<string, any>;
  ipAddress?: string;
  location?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  language?: string;
  timestamp: Date;
}

/**
 * Performance Metric Interface
 */
export interface PerformanceMetric {
  sessionId: string;
  userId?: number;
  url: string;
  metricType: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'custom';
  value: number;
  unit: string;
  score?: number;
  meetsThreshold: boolean;
  threshold?: number;
  description?: string;
  priority: AnalyticsEventPriority;
  isMonitored: boolean;
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage?: number;
  timestamp: Date;
  memoryInfo?: Record<string, any>;
  navigationTiming?: Record<string, any>;
  resourceTiming?: Record<string, any>;
  paintTiming?: Record<string, any>;
  customData?: Record<string, any>;
  alerts?: Record<string, any>;
  tags?: string[];
  properties?: Record<string, any>;
  ipAddress?: string;
  location?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  language?: string;
}

/**
 * Dashboard Data Interface
 */
export interface DashboardData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionDuration: number;
    pageViews: number;
  };
  performance: {
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    averageFCP: number;
    performanceScore: number;
    errorRate: number;
  };
  featureUsage: {
    taskCreation: number;
    taskCompletion: number;
    searchUsage: number;
    filterUsage: number;
    bulkActions: number;
  };
  errors: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    errorTrend: number;
  };
  timeRange: string;
  generatedAt: Date;
}

/**
 * Real-time Dashboard Update Interface
 */
export interface DashboardUpdate {
  updateType: string;
  data: any;
  priority: AnalyticsEventPriority;
  broadcastToAll: boolean;
  targetUserIds?: number[];
  timestamp: Date;
}

/**
 * Analytics Stream Interface
 */
export interface AnalyticsStream {
  streamType: string;
  interval: number;
  filters?: Record<string, any>;
  includeRealTime: boolean;
  includeHistorical: boolean;
  historicalHours: number;
  priority: AnalyticsEventPriority;
  tags?: string[];
}

/**
 * Analytics Service Class
 */
class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/analytics';
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const token = tokenManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Track analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Analytics event tracking failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Analytics event tracking error:', error);
      throw error;
    }
  }

  /**
   * Create or update user session
   */
  async createOrUpdateSession(session: UserSession): Promise<UserSession> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(session)
      });

      if (!response.ok) {
        throw new Error(`Session update failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Session update error:', error);
      throw error;
    }
  }

  /**
   * Report error
   */
  async reportError(error: ErrorReport): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/errors`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(error)
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error reporting error:', error);
      throw error;
    }
  }

  /**
   * Track performance metric
   */
  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/performance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(metric)
      });

      if (!response.ok) {
        throw new Error(`Performance tracking failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Performance tracking error:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(timeRange: string = '7d', userId?: number): Promise<DashboardData> {
    try {
      const params = new URLSearchParams({ timeRange });
      if (userId) {
        params.append('userId', userId.toString());
      }

      const response = await fetch(`${this.baseUrl}/dashboard?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dashboard data fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      throw error;
    }
  }

  /**
   * Connect to real-time dashboard
   */
  async connectToDashboard(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/connect`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dashboard connection failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Dashboard connection error:', error);
      throw error;
    }
  }

  /**
   * Update dashboard with real-time data
   */
  async updateDashboard(update: DashboardUpdate): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/update`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        throw new Error(`Dashboard update failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Dashboard update error:', error);
      throw error;
    }
  }

  /**
   * Start analytics stream
   */
  async startAnalyticsStream(stream: AnalyticsStream): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/stream`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(stream)
      });

      if (!response.ok) {
        throw new Error(`Analytics stream start failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Analytics stream start error:', error);
      throw error;
    }
  }

  /**
   * Get analytics events with filtering
   */
  async getAnalyticsEvents(
    sessionId?: string,
    eventType?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ events: AnalyticsEvent[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (sessionId) {
        params.append('sessionId', sessionId);
      }

      if (eventType) {
        params.append('eventType', eventType);
      }

      const response = await fetch(`${this.baseUrl}/events?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Analytics events fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics events fetch error:', error);
      throw error;
    }
  }

  /**
   * Get error reports with filtering
   */
  async getErrorReports(
    severity?: string,
    category?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ errors: ErrorReport[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (severity) {
        params.append('severity', severity);
      }

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/errors?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error reports fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reports fetch error:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics with filtering
   */
  async getPerformanceMetrics(
    metricType?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ metrics: PerformanceMetric[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (metricType) {
        params.append('metricType', metricType);
      }

      const response = await fetch(`${this.baseUrl}/performance?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Performance metrics fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Performance metrics fetch error:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    format: 'json' | 'csv' | 'excel',
    timeRange: string,
    filters?: Record<string, any>
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          format,
          timeRange,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Analytics export error:', error);
      throw error;
    }
  }

  /**
   * Get user journey data
   */
  async getUserJourney(userId: number, timeRange: string = '7d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user-journey?userId=${userId}&timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`User journey fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('User journey fetch error:', error);
      throw error;
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(funnelType: string, timeRange: string = '7d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/conversion-funnel?funnelType=${funnelType}&timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Conversion funnel fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Conversion funnel fetch error:', error);
      throw error;
    }
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ab-test/${testId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`A/B test results fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('A/B test results fetch error:', error);
      throw error;
    }
  }

  /**
   * Get predictive analytics insights
   */
  async getPredictiveInsights(timeRange: string = '30d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predictive-insights?timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Predictive insights fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Predictive insights fetch error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService; 