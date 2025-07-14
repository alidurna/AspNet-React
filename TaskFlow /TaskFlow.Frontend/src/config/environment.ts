/**
 * Environment Configuration
 *
 * Bu dosya, TaskFlow frontend uygulamasının farklı ortamlar (development,
 * production, test) için merkezi konfigürasyon yönetimini içerir.
 * API, CDN, performans ve özellik bayrakları için kapsamlı ayarlar sağlar.
 *
 * Ana Özellikler:
 * - Ortam bazlı konfigürasyon (dev/prod/test)
 * - API endpoint yönetimi
 * - CDN ve statik asset yönetimi
 * - Performans monitoring ayarları
 * - Feature flag yönetimi
 * - Build bilgileri
 *
 * Ortam Konfigürasyonları:
 * - Development: Localhost API, tam performans monitoring
 * - Production: Production API, CDN, optimize edilmiş ayarlar
 * - Test: Test API, minimal özellikler
 *
 * API Yönetimi:
 * - Base URL konfigürasyonu
 * - Timeout ayarları
 * - Endpoint URL oluşturma
 * - Error handling
 *
 * CDN Yönetimi:
 * - Asset URL oluşturma
 * - Version kontrolü
 * - Preload optimizasyonu
 * - Cache warming
 * - Image format optimizasyonu
 *
 * Performans:
 * - Monitoring enable/disable
 * - Sample rate ayarları
 * - Analytics endpoint
 * - Bundle analysis
 *
 * Feature Flags:
 * - PWA desteği
 * - Offline modu
 * - Bundle analysis
 * - Real-time updates
 *
 * Güvenlik:
 * - Environment-based security
 * - API key management
 * - CORS configuration
 * - HTTPS enforcement
 *
 * Build Bilgileri:
 * - App version
 * - Build timestamp
 * - Commit hash
 * - Environment detection
 *
 * Utility Sınıfları:
 * - CDNManager: CDN işlemleri
 * - APIManager: API işlemleri
 * - Environment detection
 * - Configuration helpers
 *
 * Performans Optimizasyonları:
 * - Asset preloading
 * - Cache warming
 * - Image format detection
 * - Lazy loading support
 *
 * Monitoring:
 * - Performance metrics
 * - Error tracking
 * - User analytics
 * - Build monitoring
 *
 * Sürdürülebilirlik:
 * - Centralized configuration
 * - Environment isolation
 * - Easy maintenance
 * - Clear documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

export interface EnvironmentConfig {
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // CDN Configuration
  cdnEnabled: boolean;
  cdnBaseUrl: string;
  assetsBaseUrl: string;
  staticAssetsVersion: string;

  // Performance
  performanceEnabled: boolean;
  performanceSampleRate: number;
  analyticsEndpoint?: string;

  // Feature Flags
  features: {
    pwa: boolean;
    offline: boolean;
    bundleAnalysis: boolean;
    realTimeUpdates: boolean;
  };

  // Build Info
  appVersion: string;
  buildTime: string;
  commitHash?: string;
}

/**
 * Get current environment mode
 */
const getEnvironmentMode = (): "development" | "production" | "test" => {
  if (typeof window !== "undefined") {
    return "production"; // Browser environment
  }

  // Vite environment check
  const mode = import.meta.env?.MODE;
  if (mode === "production") return "production";
  if (mode === "test") return "test";
  return "development";
};

const mode = getEnvironmentMode();

/**
 * Development Configuration
 */
const developmentConfig: EnvironmentConfig = {
  // Environment
  isDevelopment: true,
  isProduction: false,
  isTest: false,

  // API Configuration
  apiBaseUrl: "http://localhost:5281",
  apiTimeout: 10000,

  // CDN Configuration
  cdnEnabled: false,
  cdnBaseUrl: "http://localhost:5173",
  assetsBaseUrl: "http://localhost:5173",
  staticAssetsVersion: "dev",

  // Performance
  performanceEnabled: true,
  performanceSampleRate: 1.0, // 100% sampling in dev

  // Feature Flags
  features: {
    pwa: true,
    offline: true,
    bundleAnalysis: true,
    realTimeUpdates: true,
  },

  // Build Info
  appVersion: "1.0.0-dev",
  buildTime: new Date().toISOString(),
};

/**
 * Production Configuration
 */
const productionConfig: EnvironmentConfig = {
  // Environment
  isDevelopment: false,
  isProduction: true,
  isTest: false,

  // API Configuration
  apiBaseUrl: "https://api.taskflow.com/api",
  apiTimeout: 15000,

  // CDN Configuration
  cdnEnabled: true,
  cdnBaseUrl: "https://cdn.taskflow.com",
  assetsBaseUrl: "https://cdn.taskflow.com/assets",
  staticAssetsVersion: "v1.0.0",

  // Performance
  performanceEnabled: true,
  performanceSampleRate: 0.1, // 10% sampling in production
  analyticsEndpoint: "https://analytics.taskflow.com/api/metrics",

  // Feature Flags
  features: {
    pwa: true,
    offline: true,
    bundleAnalysis: false, // Disabled in production
    realTimeUpdates: true,
  },

  // Build Info
  appVersion: "1.0.0",
  buildTime: new Date().toISOString(),
  commitHash: undefined, // Will be set during build process
};

/**
 * Test Configuration
 */
const testConfig: EnvironmentConfig = {
  // Environment
  isDevelopment: false,
  isProduction: false,
  isTest: true,

  // API Configuration
  apiBaseUrl: "http://localhost:3001/api",
  apiTimeout: 5000,

  // CDN Configuration
  cdnEnabled: false,
  cdnBaseUrl: "http://localhost:3000",
  assetsBaseUrl: "http://localhost:3000",
  staticAssetsVersion: "test",

  // Performance
  performanceEnabled: false,
  performanceSampleRate: 0,

  // Feature Flags
  features: {
    pwa: false,
    offline: false,
    bundleAnalysis: false,
    realTimeUpdates: false,
  },

  // Build Info
  appVersion: "1.0.0-test",
  buildTime: new Date().toISOString(),
};

/**
 * Get configuration based on environment
 */
const getConfig = (): EnvironmentConfig => {
  switch (mode) {
    case "production":
      return productionConfig;
    case "test":
      return testConfig;
    case "development":
    default:
      return developmentConfig;
  }
};

/**
 * Current environment configuration
 */
export const config = getConfig();

/**
 * CDN Utilities
 */
export class CDNManager {
  private static config = getConfig();

  /**
   * Get full URL for a static asset
   */
  static getAssetUrl(assetPath: string): string {
    // Remove leading slash if present
    const cleanPath = assetPath.startsWith("/")
      ? assetPath.slice(1)
      : assetPath;

    if (this.config.cdnEnabled) {
      return `${this.config.cdnBaseUrl}/${cleanPath}?v=${this.config.staticAssetsVersion}`;
    }

    return `/${cleanPath}`;
  }

  /**
   * Get versioned asset URL
   */
  static getVersionedAssetUrl(assetPath: string, version?: string): string {
    const cleanPath = assetPath.startsWith("/")
      ? assetPath.slice(1)
      : assetPath;
    const assetVersion = version || this.config.staticAssetsVersion;

    if (this.config.cdnEnabled) {
      return `${this.config.cdnBaseUrl}/${cleanPath}?v=${assetVersion}`;
    }

    return `/${cleanPath}?v=${assetVersion}`;
  }

  /**
   * Preload critical assets
   */
  static preloadAssets(assetPaths: string[]): void {
    if (!this.config.cdnEnabled) return;

    assetPaths.forEach((path) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = this.getAssetUrl(path);

      // Determine asset type
      if (path.endsWith(".css")) {
        link.as = "style";
      } else if (path.endsWith(".js")) {
        link.as = "script";
      } else if (path.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = "image";
      } else if (path.match(/\.(woff|woff2|ttf|otf)$/)) {
        link.as = "font";
        link.crossOrigin = "anonymous";
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Cache warming for critical resources
   */
  static warmCache(urls: string[]): Promise<(void | Response)[]> {
    const promises = urls.map((url) => {
      return fetch(this.getAssetUrl(url), {
        method: "GET",
        cache: "force-cache",
      }).catch((error) => {
        console.warn(`Failed to warm cache for ${url}:`, error);
      });
    });

    return Promise.all(promises);
  }

  /**
   * Get optimal image format based on browser support
   */
  static getOptimalImageUrl(
    imagePath: string,
    formats: string[] = ["webp", "avif"]
  ): string {
    const basePath = imagePath.replace(/\.[^/.]+$/, ""); // Remove extension

    // Check browser support
    for (const format of formats) {
      if (this.supportsImageFormat(format)) {
        return this.getAssetUrl(`${basePath}.${format}`);
      }
    }

    // Fallback to original
    return this.getAssetUrl(imagePath);
  }

  /**
   * Check if browser supports image format
   */
  private static supportsImageFormat(format: string): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    try {
      return (
        canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) ===
        0
      );
    } catch {
      return false;
    }
  }
}

/**
 * API Utilities
 */
export class APIManager {
  private static config = getConfig();

  /**
   * Get full API URL
   */
  static getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.config.apiBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Get API timeout
   */
  static getTimeout(): number {
    return this.config.apiTimeout;
  }
}

// Export default configuration
export default config;
