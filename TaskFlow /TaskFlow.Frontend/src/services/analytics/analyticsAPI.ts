/**
 * Analytics API Service
 * 
 * Analytics verilerini backend'e gönderen API servisi.
 * Event tracking, session management ve error reporting için API çağrıları yapar.
 */

import { tokenManager } from '../api';
import type { AnalyticsEvent, UserSession, PerformanceMetrics } from './analyticsCore';

/**
 * Analytics API Response Interface
 */
interface AnalyticsApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Batch Event Request Interface
 */
interface BatchEventRequest {
  events: AnalyticsEvent[];
  sessionId: string;
  timestamp: Date;
}

/**
 * Analytics API Class
 * Backend ile analytics verilerini senkronize eder
 */
export class AnalyticsAPI {
  private baseUrl: string;
  private maxRetries: number;

  constructor(baseUrl: string = '/api/analytics', maxRetries: number = 3) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
  }

  /**
   * HTTP request helper
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AnalyticsApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = tokenManager.getToken();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === this.maxRetries) {
          console.error(`Analytics API request failed after ${this.maxRetries} attempts:`, lastError);
          break;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return {
      success: false,
      message: lastError?.message || 'Request failed',
    };
  }

  /**
   * Tek event gönderir
   */
  public async trackEvent(event: AnalyticsEvent): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  /**
   * Batch event gönderir
   */
  public async trackEvents(events: AnalyticsEvent[]): Promise<AnalyticsApiResponse> {
    const batchRequest: BatchEventRequest = {
      events,
      sessionId: events[0]?.sessionId || '',
      timestamp: new Date(),
    };

    return this.makeRequest('/events/batch', {
      method: 'POST',
      body: JSON.stringify(batchRequest),
    });
  }

  /**
   * Session başlatır
   */
  public async startSession(session: UserSession): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  /**
   * Session günceller
   */
  public async updateSession(sessionId: string, updates: Partial<UserSession>): Promise<AnalyticsApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Session sonlandırır
   */
  public async endSession(sessionId: string): Promise<AnalyticsApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  /**
   * Error report gönderir
   */
  public async reportError(error: {
    message: string;
    stack?: string;
    url: string;
    timestamp: Date;
    userAgent: string;
    sessionId: string;
    userId?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context?: Record<string, any>;
  }): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/errors', {
      method: 'POST',
      body: JSON.stringify(error),
    });
  }

  /**
   * Performance metrics gönderir
   */
  public async trackPerformance(metrics: PerformanceMetrics & {
    sessionId: string;
    userId?: number;
    page: string;
  }): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/performance', {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }

  /**
   * Dashboard verilerini alır
   */
  public async getDashboardData(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<AnalyticsApiResponse<{
    totalEvents: number;
    totalSessions: number;
    totalUsers: number;
    topPages: Array<{ page: string; views: number }>;
    topEvents: Array<{ event: string; count: number }>;
    performanceMetrics: {
      avgLoadTime: number;
      avgSessionDuration: number;
      bounceRate: number;
    };
  }>> {
    const params = dateRange 
      ? `?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
      : '';
    
    return this.makeRequest(`/dashboard${params}`, {
      method: 'GET',
    });
  }

  /**
   * Real-time analytics bağlantısı kurar
   */
  public async connectRealTime(sessionId: string): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/dashboard/connect', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  /**
   * Real-time analytics güncellemesi gönderir
   */
  public async sendRealTimeUpdate(data: {
    sessionId: string;
    event: AnalyticsEvent;
  }): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/dashboard/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Analytics stream başlatır
   */
  public async startStream(config: {
    sessionId: string;
    filters?: Record<string, any>;
    realTime?: boolean;
  }): Promise<AnalyticsApiResponse> {
    return this.makeRequest('/stream', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * User journey verilerini alır
   */
  public async getUserJourney(userId: number, sessionId?: string): Promise<AnalyticsApiResponse<{
    events: AnalyticsEvent[];
    sessions: UserSession[];
    totalDuration: number;
    pageViews: number;
    conversions: number;
  }>> {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    
    return this.makeRequest(`/users/${userId}/journey${params}`, {
      method: 'GET',
    });
  }

  /**
   * A/B test sonuçlarını alır
   */
  public async getABTestResults(testId: string): Promise<AnalyticsApiResponse<{
    testId: string;
    variants: Array<{
      name: string;
      participants: number;
      conversions: number;
      conversionRate: number;
    }>;
    winner?: string;
    confidence: number;
  }>> {
    return this.makeRequest(`/ab-tests/${testId}/results`, {
      method: 'GET',
    });
  }

  /**
   * Data export işlemi başlatır
   */
  public async exportData(config: {
    format: 'csv' | 'json' | 'excel';
    dateRange: { startDate: Date; endDate: Date };
    includeEvents?: boolean;
    includeSessions?: boolean;
    includePerformance?: boolean;
    filters?: Record<string, any>;
  }): Promise<AnalyticsApiResponse<{
    exportId: string;
    estimatedTime: number;
    downloadUrl?: string;
  }>> {
    return this.makeRequest('/export', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Export durumunu kontrol eder
   */
  public async getExportStatus(exportId: string): Promise<AnalyticsApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    error?: string;
  }>> {
    return this.makeRequest(`/export/${exportId}/status`, {
      method: 'GET',
    });
  }
}

export default AnalyticsAPI; 