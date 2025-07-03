/**
 * Lazy Routes - Performance Optimization
 * Code splitting and lazy loading for better initial load times
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
