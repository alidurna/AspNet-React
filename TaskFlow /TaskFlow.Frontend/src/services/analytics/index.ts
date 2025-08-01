/**
 * Analytics Services - Main Export
 * 
 * Refactored analytics servislerinin ana export dosyası.
 * Eski analyticsService.ts'in yerini alan modüler yapı.
 */

import { AnalyticsCore } from './analyticsCore';
import { AnalyticsAPI } from './analyticsAPI';
import { AnalyticsTracker } from './analyticsTracker';

// Core types ve interfaces'i export et
export * from './analyticsCore';

/**
 * Analytics Service Class
 * Eski analyticsService.ts'in yerine geçen refactored ana servis
 */
export class AnalyticsService {
  private core: AnalyticsCore;
  private api: AnalyticsAPI;
  private tracker: AnalyticsTracker;

  constructor(config: any = {}) {
    this.core = new AnalyticsCore(config);
    this.api = new AnalyticsAPI();
    this.tracker = new AnalyticsTracker(this.core, this.api);
  }

  /**
   * Event track eder (backward compatibility)
   */
  public track(eventName: string, properties: Record<string, any> = {}): void {
    this.tracker.track('custom_event', eventName, properties);
  }

  /**
   * Event track eder (yeni method)
   */
  public trackEvent(eventType: any, eventName: string, properties: Record<string, any> = {}): void {
    this.tracker.track(eventType, eventName, properties);
  }

  /**
   * Page view track eder
   */
  public trackPageView(page?: string, properties: Record<string, any> = {}): void {
    this.tracker.trackPageView(page, properties);
  }

  /**
   * Error track eder
   */
  public trackError(error: Error | string, context: Record<string, any> = {}): void {
    this.tracker.trackError(error, context);
  }

  /**
   * User interaction track eder
   */
  public trackInteraction(element: string, action: string, properties: Record<string, any> = {}): void {
    this.tracker.trackInteraction(element, action, properties);
  }

  /**
   * Session bilgilerini döndürür
   */
  public getSession() {
    return this.core.getSession();
  }

  /**
   * Configuration'u döndürür
   */
  public getConfig() {
    return this.core.getConfig();
  }

  /**
   * Events'i döndürür
   */
  public getEvents() {
    return this.core.getEvents();
  }

  /**
   * Performance metrics'i döndürür
   */
  public getPerformance() {
    return null; // Placeholder - gerçek implementation sonra eklenecek
  }

  /**
   * Events'leri flush eder
   */
  public async flushEvents(): Promise<void> {
    return this.tracker.flushEvents();
  }

  /**
   * Service'i durdurur
   */
  public stop(): void {
    this.tracker.stop();
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

/**
 * Analytics instance'ını döndürür
 */
export const getAnalytics = (config?: any): AnalyticsService => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService(config);
  }
  return analyticsInstance;
};

// Default export
export default AnalyticsService; 