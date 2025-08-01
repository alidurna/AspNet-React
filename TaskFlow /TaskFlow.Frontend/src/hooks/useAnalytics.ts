/**
 * useAnalytics Custom Hook - Refactored & Simplified
 *
 * Basitleştirilmiş analytics hook'u. External service dependency'si olmadan
 * kendi içinde minimal analytics functionality sağlar.
 */

import { useEffect, useCallback, useState } from 'react';

/**
 * Analytics Event Interface
 */
interface AnalyticsEvent {
  id: string;
  type: string;
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

/**
 * Analytics Hook Config
 */
interface UseAnalyticsConfig {
  enabled?: boolean;
  trackPageViews?: boolean;
  trackUserActions?: boolean;
  userId?: string;
}

/**
 * useAnalytics Hook - Refactored & Simplified
 * 
 * Basit analytics functionality sağlayan hook. Production'da
 * gerçek analytics service ile değiştirilebilir.
 */
export const useAnalytics = (config: UseAnalyticsConfig = {}) => {
  // ===== CONFIG =====
  const {
    enabled = true,
    trackPageViews = true,
    trackUserActions = true,
    userId
  } = config;

  // ===== STATE =====
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (!enabled) return;
    setIsInitialized(true);
  }, [enabled]);

  // ===== PAGE VIEW TRACKING =====
  useEffect(() => {
    if (!enabled || !trackPageViews || !isInitialized) return;

    // Track initial page view
    trackPageView(window.location.pathname);

    // Track navigation changes
    const handlePopState = () => {
      trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled, trackPageViews, isInitialized]);

  // ===== HELPER FUNCTIONS =====
  /**
   * Generate unique event ID
   */
  const generateEventId = useCallback(() => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Create analytics event
   */
  const createEvent = useCallback((
    type: string,
    name: string,
    properties?: Record<string, any>
  ): AnalyticsEvent => {
    return {
      id: generateEventId(),
      type,
      name,
      properties,
      timestamp: Date.now(),
      userId: currentUserId,
      sessionId
    };
  }, [generateEventId, currentUserId, sessionId]);

  /**
   * Store event (mock implementation)
   */
  const storeEvent = useCallback((event: AnalyticsEvent) => {
    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }, []);

  // ===== PUBLIC METHODS =====
  /**
   * Track custom event
   */
  const trackEvent = useCallback((
    type: string,
    name: string,
    properties?: Record<string, any>
  ) => {
    if (!enabled || !isInitialized) return;

    const event = createEvent(type, name, properties);
    storeEvent(event);
  }, [enabled, isInitialized, createEvent, storeEvent]);

  /**
   * Track page view
   */
  const trackPageView = useCallback((path?: string) => {
    if (!enabled || !isInitialized) return;

    trackEvent('page_view', path || window.location.pathname, {
      title: document.title,
      referrer: document.referrer
    });
  }, [enabled, isInitialized, trackEvent]);

  /**
   * Track user action
   */
  const trackUserAction = useCallback((
    action: string,
    element?: string,
    properties?: Record<string, any>
  ) => {
    if (!enabled || !trackUserActions || !isInitialized) return;

    trackEvent('user_action', action, {
      element,
      ...properties
    });
  }, [enabled, trackUserActions, isInitialized, trackEvent]);

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
    success: boolean,
    properties?: Record<string, any>
  ) => {
    trackEvent(success ? 'form_submit' : 'form_error', formName, {
      success,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track search
   */
  const trackSearch = useCallback((
    query: string,
    results?: number,
    properties?: Record<string, any>
  ) => {
    trackEvent('search', 'search_performed', {
      query,
      results,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track feature usage
   */
  const trackFeatureUsage = useCallback((
    feature: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('feature_usage', feature, properties);
  }, [trackEvent]);

  /**
   * Track performance metric
   */
  const trackPerformance = useCallback((
    metric: string,
    value: number,
    properties?: Record<string, any>
  ) => {
    trackEvent('performance', metric, {
      value,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track error
   */
  const trackError = useCallback((
    error: string,
    properties?: Record<string, any>
  ) => {
    trackEvent('error', error, properties);
  }, [trackEvent]);

  /**
   * Set user ID
   */
  const setUserId = useCallback((newUserId: string) => {
    if (!enabled || !isInitialized) return;

    setCurrentUserId(newUserId);
    trackEvent('identify', 'user_identified', { userId: newUserId });
  }, [enabled, isInitialized, trackEvent]);

  /**
   * Set user properties
   */
  const setUserProperties = useCallback((properties: Record<string, any>) => {
    if (!enabled || !isInitialized) return;

    trackEvent('identify', 'user_properties_updated', properties);
  }, [enabled, isInitialized, trackEvent]);

  /**
   * Get session info
   */
  const getSessionInfo = useCallback(() => {
    if (!enabled || !isInitialized) return null;

    return {
      sessionId,
      userId: currentUserId,
      eventCount: events.length,
      startTime: parseInt(sessionId.split('_')[1])
    };
  }, [enabled, isInitialized, sessionId, currentUserId, events.length]);

  /**
   * Flush events (mock implementation)
   */
  const flush = useCallback(() => {
    if (!enabled || !isInitialized) return;

    // In production, send events to analytics service
    console.log('📊 Flushing analytics events:', events.length);
  }, [enabled, isInitialized, events.length]);

  /**
   * Clear events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // ===== RETURN =====
  return {
    // State
    isInitialized,
    enabled,
    eventCount: events.length,
    
    // Event tracking
    trackEvent,
    trackPageView,
    trackUserAction,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    trackFeatureUsage,
    trackPerformance,
    trackError,
    
    // User management
    setUserId,
    setUserProperties,
    
    // Utilities
    getSessionInfo,
    flush,
    clearEvents,
    
    // Debug info (development only)
    events: process.env.NODE_ENV === 'development' ? events : []
  };
};

export default useAnalytics; 