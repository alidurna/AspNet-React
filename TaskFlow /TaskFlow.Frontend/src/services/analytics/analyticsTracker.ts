/**
 * Analytics Tracker Service
 * 
 * Event tracking, batch processing ve queue management için ana servis.
 * Kullanıcı etkileşimlerini takip eder ve backend'e gönderir.
 */

import { AnalyticsCore, type AnalyticsEvent, type AnalyticsEventType, type AnalyticsEventPriority } from './analyticsCore';
import { AnalyticsAPI } from './analyticsAPI';

/**
 * Event Queue Item Interface
 */
interface QueueItem {
  event: AnalyticsEvent;
  retryCount: number;
  priority: AnalyticsEventPriority;
  timestamp: Date;
}

/**
 * Analytics Tracker Class
 * Event tracking ve queue management'ı yönetir
 */
export class AnalyticsTracker {
  private core: AnalyticsCore;
  private api: AnalyticsAPI;
  private eventQueue: QueueItem[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private isProcessing: boolean = false;

  constructor(core: AnalyticsCore, api: AnalyticsAPI) {
    this.core = core;
    this.api = api;
    
    this.setupEventListeners();
    this.startFlushTimer();
  }

  /**
   * Event listener'ları kurar
   */
  private setupEventListeners(): void {
    // Online/offline durumu
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.core.log('Connection restored, processing queued events');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.core.log('Connection lost, events will be queued');
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });

    // Performance observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceEntry(entry);
          }
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        this.core.log('Performance observer setup failed', error);
      }
    }
  }

  /**
   * Flush timer'ı başlatır
   */
  private startFlushTimer(): void {
    const config = this.core.getConfig();
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, config.flushInterval);
  }

  /**
   * Performance entry'yi track eder
   */
  private trackPerformanceEntry(entry: PerformanceEntry): void {
    const config = this.core.getConfig();
    
    if (!config.trackPerformance) return;

    let eventName = '';
    let properties: Record<string, any> = {};

    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        eventName = 'page_load';
        properties = {
          loadTime: navEntry.loadEventEnd - navEntry.navigationStart,
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
          firstByte: navEntry.responseStart - navEntry.navigationStart,
          domComplete: navEntry.domComplete - navEntry.navigationStart,
        };
        break;

      case 'paint':
        eventName = entry.name === 'first-paint' ? 'first_paint' : 'first_contentful_paint';
        properties = {
          timing: entry.startTime,
        };
        break;

      case 'largest-contentful-paint':
        eventName = 'largest_contentful_paint';
        properties = {
          timing: entry.startTime,
          element: (entry as any).element?.tagName || 'unknown',
        };
        break;
    }

    if (eventName) {
      this.track('performance_metric', eventName, properties, 'low');
    }
  }

  /**
   * Event track eder
   */
  public track(
    eventType: AnalyticsEventType,
    eventName: string,
    properties: Record<string, any> = {},
    priority: AnalyticsEventPriority = 'medium'
  ): void {
    const config = this.core.getConfig();
    
    if (!config.enabled) return;

    const event = this.core.createEvent(eventType, eventName, properties, priority);
    
    this.core.log(`Tracking event: ${eventType}:${eventName}`, properties);
    this.core.addEvent(event);

    // Queue'ya ekle
    this.eventQueue.push({
      event,
      retryCount: 0,
      priority,
      timestamp: new Date(),
    });

    // Kritik event'ler hemen gönderilir
    if (priority === 'critical' || this.eventQueue.length >= config.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Page view track eder
   */
  public trackPageView(page?: string, properties: Record<string, any> = {}): void {
    const config = this.core.getConfig();
    
    if (!config.trackPageViews) return;

    const session = this.core.getSession();
    if (session) {
      session.pageViews++;
    }

    this.track('page_view', 'page_viewed', {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    });
  }

  /**
   * User interaction track eder
   */
  public trackInteraction(
    element: string,
    action: string,
    properties: Record<string, any> = {}
  ): void {
    const config = this.core.getConfig();
    
    if (!config.trackUserInteractions) return;

    this.track('user_action', `${element}_${action}`, {
      element,
      action,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }

  /**
   * Error track eder
   */
  public trackError(
    error: Error | string,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const config = this.core.getConfig();
    
    if (!config.trackErrors) return;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;

    this.track('error_occurred', 'error_tracked', {
      message: errorMessage,
      stack,
      context,
      severity,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }, severity as AnalyticsEventPriority);

    // API'ye de error report gönder
    if (this.isOnline) {
      const session = this.core.getSession();
      this.api.reportError({
        message: errorMessage,
        stack,
        url: window.location.href,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: session?.sessionId || '',
        userId: config.userId,
        severity,
        context,
      }).catch(err => {
        this.core.log('Failed to report error to API', err);
      });
    }
  }

  /**
   * Custom event track eder
   */
  public trackCustom(
    eventName: string,
    properties: Record<string, any> = {},
    priority: AnalyticsEventPriority = 'medium'
  ): void {
    this.track('custom_event', eventName, properties, priority);
  }

  /**
   * Events'leri flush eder
   */
  public async flushEvents(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      await this.processQueue();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Queue'yu işler
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    const config = this.core.getConfig();
    const batchSize = Math.min(config.batchSize, this.eventQueue.length);
    const batch = this.eventQueue.splice(0, batchSize);

    this.core.log(`Processing batch of ${batch.length} events`);

    try {
      const events = batch.map(item => item.event);
      const response = await this.api.trackEvents(events);

      if (response.success) {
        this.core.log(`Successfully sent ${events.length} events`);
      } else {
        // Başarısız olan event'leri geri koy
        this.requeueFailedEvents(batch);
        this.core.log('Failed to send events, requeuing', response.message);
      }
    } catch (error) {
      // Network hatası durumunda event'leri geri koy
      this.requeueFailedEvents(batch);
      this.core.log('Network error while sending events', error);
    }

    // Kalan event'ler varsa devam et
    if (this.eventQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Başarısız event'leri tekrar queue'ya ekler
   */
  private requeueFailedEvents(failedBatch: QueueItem[]): void {
    const config = this.core.getConfig();
    
    const retryableEvents = failedBatch.filter(item => {
      item.retryCount++;
      return item.retryCount <= config.maxRetries;
    });

    // Başa ekle (priority queue gibi)
    this.eventQueue.unshift(...retryableEvents);

    const droppedCount = failedBatch.length - retryableEvents.length;
    if (droppedCount > 0) {
      this.core.log(`Dropped ${droppedCount} events after max retries`);
    }
  }

  /**
   * Queue'yu temizler
   */
  public clearQueue(): void {
    this.eventQueue = [];
    this.core.clearEvents();
    this.core.log('Event queue cleared');
  }

  /**
   * Queue durumunu döndürür
   */
  public getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    isOnline: boolean;
    pendingEvents: number;
  } {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
      pendingEvents: this.core.getEvents().length,
    };
  }

  /**
   * Tracker'ı durdurur
   */
  public stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Son event'leri gönder
    this.flushEvents();
    
    this.core.log('Analytics tracker stopped');
  }
}

export default AnalyticsTracker; 