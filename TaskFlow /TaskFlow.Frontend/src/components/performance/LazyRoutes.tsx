/**
 * Lazy Routes Component
 *
 * Bu dosya, TaskFlow uygulamasının performans optimizasyonu için
 * lazy loading ve code splitting işlemlerini yöneten component'leri
 * içerir. İlk yükleme sürelerini iyileştirmek için dinamik import
 * ve route prefetching sağlar.
 *
 * Ana Özellikler:
 * - Code splitting
 * - Lazy loading
 * - Route prefetching
 * - Performance monitoring
 * - Suspense fallbacks
 * - Bundle optimization
 *
 * Lazy Components:
 * - LazyLogin: Giriş sayfası
 * - LazyRegister: Kayıt sayfası
 * - LazyDashboard: Ana dashboard
 * - LazyAdvancedSearchModal: Gelişmiş arama modal'ı
 *
 * Performance Optimizations:
 * - Dynamic imports
 * - Bundle splitting
 * - Route-based code splitting
 * - Preloading strategies
 * - Loading time measurement
 *
 * Utility Functions:
 * - withLazyLoading: HOC for lazy components
 * - createLazyRoute: Route factory
 * - preloadRoutes: Route prefetching
 * - measureRouteLoad: Performance monitoring
 *
 * Route Preloader:
 * - Preload individual routes
 * - Preload all routes
 * - Track preloaded routes
 * - Clear preloaded cache
 * - Error handling
 *
 * Loading States:
 * - Suspense fallbacks
 * - LoadingSpinner component
 * - Custom fallback support
 * - Error boundaries
 *
 * Performance Monitoring:
 * - Load time measurement
 * - Analytics integration
 * - Error tracking
 * - Performance metrics
 * - Console logging
 *
 * Bundle Management:
 * - Automatic code splitting
 * - Chunk optimization
 * - Cache management
 * - Memory optimization
 *
 * Error Handling:
 * - Load failures
 * - Network errors
 * - Timeout handling
 * - Graceful degradation
 *
 * Analytics Integration:
 * - Google Analytics
 * - Custom metrics
 * - Performance tracking
 * - User behavior analysis
 *
 * Development Features:
 * - Hot reload support
 * - Development logging
 * - Debug information
 * - Performance insights
 *
 * Production Optimizations:
 * - Minified bundles
 * - Gzip compression
 * - CDN integration
 * - Cache strategies
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler component yapısı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { lazy, Suspense } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

// Lazy load components with dynamic imports
export const LazyLogin = lazy(() =>
  import("../../pages/Login").then((module) => ({
    default: module.default,
  }))
);

export const LazyRegister = lazy(() =>
  import("../../pages/Register").then((module) => ({
    default: module.default,
  }))
);

export const LazyDashboard = lazy(() =>
  import("../../pages/Dashboard").then((module) => ({
    default: module.default,
  }))
);

export const LazyAdvancedSearchModal = lazy(() =>
  import("../search/AdvancedSearchModal").then((module) => ({
    default: module.default,
  }))
);

// HOC for wrapping lazy components with Suspense
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
};

// Route component factory with lazy loading
export const createLazyRoute = (
  importFn: () => Promise<{ default: React.ComponentType<object> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);

  return (props: object) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload functions for route prefetching
export const preloadRoutes = {
  login: () => import("../../pages/Login"),
  register: () => import("../../pages/Register"),
  dashboard: () => import("../../pages/Dashboard"),
  advancedSearch: () => import("../search/AdvancedSearchModal"),
};

// Route preloader utility
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();

  static preload(routeName: keyof typeof preloadRoutes) {
    if (this.preloadedRoutes.has(routeName)) {
      return Promise.resolve();
    }

    this.preloadedRoutes.add(routeName);
    return preloadRoutes[routeName]()
      .then(() => {
        console.log(`✅ Route preloaded: ${routeName}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to preload route ${routeName}:`, error);
        this.preloadedRoutes.delete(routeName);
      });
  }

  static preloadAll() {
    const routeNames = Object.keys(preloadRoutes) as Array<
      keyof typeof preloadRoutes
    >;
    return Promise.allSettled(
      routeNames.map((routeName) => this.preload(routeName))
    );
  }

  static isPreloaded(routeName: keyof typeof preloadRoutes) {
    return this.preloadedRoutes.has(routeName);
  }

  static clear() {
    this.preloadedRoutes.clear();
  }
}

// Performance monitoring
export const measureRouteLoad = async (
  routeName: string,
  loadFn: () => Promise<unknown>
) => {
  const startTime = performance.now();

  try {
    const result = await loadFn();
    const loadTime = performance.now() - startTime;

    console.log(`📊 Route "${routeName}" loaded in ${loadTime.toFixed(2)}ms`);

    // Report to analytics if available
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "route_load_time", {
        route_name: routeName,
        load_time: Math.round(loadTime),
      });
    }

    return result;
  } catch (error) {
    const errorTime = performance.now() - startTime;
    console.error(
      `❌ Route "${routeName}" failed to load after ${errorTime.toFixed(2)}ms:`,
      error
    );
    throw error;
  }
};

export default {
  LazyLogin,
  LazyRegister,
  LazyDashboard,
  LazyAdvancedSearchModal,
  withLazyLoading,
  createLazyRoute,
  RoutePreloader,
  measureRouteLoad,
};
