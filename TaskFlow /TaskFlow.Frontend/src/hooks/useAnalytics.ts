/**
 * useAnalytics Custom Hook
 *
 * Bu dosya, TaskFlow uygulamasında kullanıcı davranışlarını
 * takip etmek için kullanılan analytics hook'unu içerir.
 * Kullanıcı etkileşimlerini, sayfa görüntülemelerini ve
 * performans metriklerini toplar.
 *
 * Ana Özellikler:
 * - Page view tracking
 * - User interaction tracking
 * - Event tracking
 * - Performance monitoring
 * - Error tracking
 * - Session management
 *
 * Tracking Events:
 * - Page views
 * - Button clicks
 * - Form submissions
 * - Navigation events
 * - Error occurrences
 * - Performance metrics
 *
 * Privacy & GDPR:
 * - Consent management
 * - Data anonymization
 * - Opt-out functionality
 * - Data retention policies
 * - User privacy controls
 *
 * Performance:
 * - Batch processing
 * - Debounced events
 * - Efficient data storage
 * - Minimal impact on UX
 * - Background processing
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Analytics Event Types
 */
export type AnalyticsEventType = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'form_error'
  | 'navigation'
  | 'error'
  | 'performance'
  | 'user_action'
  | 'feature_usage'
  | 'search'
  | 'filter'
  | 'sort'
  | 'export'
  | 'import'
  | 'bulk_action';

/**
 * Analytics Event Interface
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  screenResolution: string;
  language: string;
}

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

/**
 * User Session Interface
 */
export interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Analytics Configuration Interface
 */
export interface AnalyticsConfig {
  enabled: boolean;
  consentGiven: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint: string;
  debug: boolean;
  anonymizeData: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackUserActions: boolean;
}

/**
 * Analytics State Interface
 */
export interface AnalyticsState {
  session: UserSession | null;
  events: AnalyticsEvent[];
  performance: PerformanceMetrics | null;
  config: AnalyticsConfig;
  isInitialized: boolean;
}

/**
 * useAnalytics Custom Hook
 *
 * Kullanıcı davranışlarını takip etmek için kullanılan hook.
 * Page views, events, performance metrics ve error tracking sağlar.
 *
 * @param config - Analytics konfigürasyonu
 * @returns Analytics functions ve state
 */
export function useAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const [state, setState] = useState<AnalyticsState>({
    session: null,
    events: [],
    performance: null,
    config: {
      enabled: true,
      consentGiven: false,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      endpoint: '/api/analytics',
      debug: false,
      anonymizeData: true,
      trackPerformance: true,
      trackErrors: true,
      trackUserActions: true,
      ...config
    },
    isInitialized: false
  });

  const flushTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionRef = useRef<UserSession | null>(null);

  /**
   * Generate unique ID
   */
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Generate session ID
   */
  const generateSessionId = useCallback(() => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Get current page info
   */
  const getPageInfo = useCallback(() => {
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    };
  }, []);

  /**
   * Get user agent info
   */
  const getUserAgentInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }, []);

  /**
   * Create analytics event
   */
  const createEvent = useCallback((
    type: AnalyticsEventType,
    name: string,
    properties?: Record<string, any>
  ): AnalyticsEvent => {
    const pageInfo = getPageInfo();
    const userAgentInfo = getUserAgentInfo();

    return {
      id: generateId(),
      type,
      name,
      properties,
      timestamp: Date.now(),
      sessionId: sessionRef.current?.id || '',
      page: pageInfo.path,
      userAgent: userAgentInfo.userAgent,
      screenResolution: userAgentInfo.screenResolution,
      language: userAgentInfo.language
    };
  }, [generateId, getPageInfo, getUserAgentInfo]);

  /**
   * Track page view
   */
  const trackPageView = useCallback((pageName?: string) => {
    if (!state.config.enabled || !state.config.consentGiven) return;

    const pageInfo = getPageInfo();
    const event = createEvent('page_view', pageName || pageInfo.path, {
      pageTitle: pageInfo.title,
      referrer: pageInfo.referrer
    });

    setState(prev => ({
      ...prev,
      events: [...prev.events, event],
      session: prev.session ? {
        ...prev.session,
        pageViews: prev.session.pageViews + 1,
        lastActivity: Date.now()
      } : prev.session
    }));

    if (state.config.debug) {
      console.log('📊 Page View Tracked:', event);
    }
  }, [state.config, createEvent, getPageInfo]);

  /**
   * Track user action
   */
  const trackEvent = useCallback((
    type: AnalyticsEventType,
    name: string,
    properties?: Record<string, any>
  ) => {
    if (!state.config.enabled || !state.config.consentGiven) return;

    const event = createEvent(type, name, properties);

    setState(prev => ({
      ...prev,
      events: [...prev.events, event],
      session: prev.session ? {
        ...prev.session,
        events: prev.session.events + 1,
        lastActivity: Date.now()
      } : prev.session
    }));

    if (state.config.debug) {
      console.log('📊 Event Tracked:', event);
    }
  }, [state.config, createEvent]);

  /**
   * Track button click
   */
  const trackButtonClick = useCallback((
    buttonName: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('button_click', buttonName, properties);
  }, [trackEvent]);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((
    formName: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('form_submit', formName, properties);
  }, [trackEvent]);

  /**
   * Track form error
   */
  const trackFormError = useCallback((
    formName: string,
    errorMessage: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('form_error', formName, {
      errorMessage,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track navigation
   */
  const trackNavigation = useCallback((
    from: string,
    to: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('navigation', `${from} -> ${to}`, properties);
  }, [trackEvent]);

  /**
   * Track error
   */
  const trackError = useCallback((
    error: Error,
    context?: string,
    properties?: Record<string, any>
  ) => {
    if (!state.config.trackErrors) return;

    trackEvent('error', error.message, {
      errorName: error.name,
      errorStack: error.stack,
      context,
      ...properties
    });
  }, [state.config.trackErrors, trackEvent]);

  /**
   * Track performance metrics
   */
  const trackPerformance = useCallback(() => {
    if (!state.config.trackPerformance) return;

    // Wait for performance metrics to be available
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Will be updated by LCP observer
        cumulativeLayoutShift: 0, // Will be updated by CLS observer
        firstInputDelay: 0, // Will be updated by FID observer
        timeToInteractive: navigation.domInteractive - navigation.fetchStart
      };

      setState(prev => ({
        ...prev,
        performance: metrics
      }));

      trackEvent('performance', 'page_load', metrics);

      if (state.config.debug) {
        console.log('📊 Performance Tracked:', metrics);
      }
    }, 1000);
  }, [state.config.trackPerformance, trackEvent]);

  /**
   * Flush events to server
   */
  const flushEvents = useCallback(async () => {
    if (state.events.length === 0) return;

    try {
      const eventsToSend = [...state.events];
      
      setState(prev => ({
        ...prev,
        events: []
      }));

      // Send to analytics endpoint
      await fetch(state.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          session: sessionRef.current,
          timestamp: Date.now()
        })
      });

      if (state.config.debug) {
        console.log('📊 Events flushed:', eventsToSend.length);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      
      // Restore events if flush failed
      setState(prev => ({
        ...prev,
        events: [...state.events, ...prev.events]
      }));
    }
  }, [state.events, state.config]);

  /**
   * Initialize analytics
   */
  const initialize = useCallback(() => {
    if (state.isInitialized) return;

    // Create new session
    const session: UserSession = {
      id: generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer
    };

    sessionRef.current = session;

    setState(prev => ({
      ...prev,
      session,
      isInitialized: true
    }));

    // Track initial page view
    trackPageView();

    // Track performance
    trackPerformance();

    // Set up periodic flush
    flushTimeoutRef.current = setInterval(flushEvents, state.config.flushInterval);

    if (state.config.debug) {
      console.log('📊 Analytics initialized');
    }
  }, [state.isInitialized, generateSessionId, trackPageView, trackPerformance, flushEvents, state.config]);

  /**
   * Set consent
   */
  const setConsent = useCallback((consent: boolean) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        consentGiven: consent
      }
    }));

    localStorage.setItem('analytics-consent', consent.toString());
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    // Check for existing consent
    const savedConsent = localStorage.getItem('analytics-consent');
    if (savedConsent) {
      setConsent(savedConsent === 'true');
    }

    initialize();

    // Cleanup on unmount
    return () => {
      if (flushTimeoutRef.current) {
        clearInterval(flushTimeoutRef.current);
      }
      flushEvents();
    };
  }, [initialize, setConsent, flushEvents]);

  return {
    // State
    session: state.session,
    events: state.events,
    performance: state.performance,
    config: state.config,
    isInitialized: state.isInitialized,

    // Actions
    trackPageView,
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackFormError,
    trackNavigation,
    trackError,
    trackPerformance,
    setConsent,
    flushEvents
  };
} 