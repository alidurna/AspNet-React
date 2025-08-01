/**
 * Analytics Core Service
 * 
 * Analytics sisteminin temel types, interfaces ve core functionality'sini içerir.
 * Diğer analytics servislerinin temelini oluşturur.
 */

import { tokenManager } from '../api';

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
  priority: AnalyticsEventPriority;
  metadata?: Record<string, any>;
}

/**
 * User Session Interface
 */
export interface UserSession {
  sessionId: string;
  userId?: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: number;
  isActive: boolean;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    language: string;
    timezone: string;
  };
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

/**
 * Analytics Configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  apiEndpoint: string;
  apiKey?: string;
  userId?: number;
  sessionTimeout: number;
  trackPageViews: boolean;
  trackUserInteractions: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
}

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  memoryUsage?: number;
  connectionType?: string;
  timestamp: Date;
}

/**
 * Analytics Core Class
 * Temel analytics functionality'sini sağlar
 */
export class AnalyticsCore {
  private config: AnalyticsConfig;
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private session: UserSession | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      apiEndpoint: '/api/analytics',
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      trackPageViews: true,
      trackUserInteractions: true,
      trackErrors: true,
      trackPerformance: true,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  /**
   * Session ID üretir
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Session'u başlatır
   */
  private initializeSession(): void {
    this.session = {
      sessionId: this.sessionId,
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      isActive: true,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  }

  /**
   * Event oluşturur
   */
  public createEvent(
    eventType: AnalyticsEventType,
    eventName: string,
    properties: Record<string, any> = {},
    priority: AnalyticsEventPriority = 'medium'
  ): AnalyticsEvent {
    return {
      eventType,
      eventName,
      sessionId: this.sessionId,
      userId: this.config.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      properties,
      timestamp: new Date(),
      referrer: document.referrer,
      isSuccessful: true,
      priority,
      metadata: {
        url: window.location.href,
        title: document.title
      }
    };
  }

  /**
   * Configuration'u günceller
   */
  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Session bilgilerini döndürür
   */
  public getSession(): UserSession | null {
    return this.session;
  }

  /**
   * Configuration'u döndürür
   */
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Events listesini döndürür
   */
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Event ekler
   */
  public addEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    if (this.session) {
      this.session.events++;
    }
  }

  /**
   * Events'i temizler
   */
  public clearEvents(): void {
    this.events = [];
  }

  /**
   * Debug log
   */
  public log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, data);
    }
  }
}

export default AnalyticsCore; 