import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * Vite Konfigürasyon Dosyası - TaskFlow Frontend
 *
 * Bu dosya, Vite build tool'unun yapılandırmasını içerir.
 * Vite, modern web geliştirme için hızlı ve hafif bir build tool'dur.
 *
 * Özellikler:
 * - React plugin entegrasyonu
 * - Hot Module Replacement (HMR) - canlı kod güncelleme
 * - TypeScript desteği
 * - ES modules desteği
 * - Optimized production build
 * - Bundle Analysis Tools - rollup-plugin-visualizer ve vite-plugin-bundle-analyzer
 * - CDN Integration - Asset delivery optimization
 *
 * Vite'ın Avantajları:
 * - Çok hızlı development server
 * - Instant HMR (değişiklikler anında yansır)
 * - ES modules tabanlı (native browser support)
 * - Rollup tabanlı production build
 * - Zero-config TypeScript desteği
 *
 * Development vs Production:
 * - Dev: ES modules ile native browser'da çalışır
 * - Prod: Rollup ile bundle'lanır ve optimize edilir
 *
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  // ===== ENVIRONMENT CONFIGURATION =====
  const isDevelopment = mode === "development";
  const isProduction = mode === "production";

  // CDN Base URL Configuration
  const getCDNBaseUrl = () => {
    if (isDevelopment) {
      return "/"; // Local development
    }
    if (isProduction) {
      return process.env.VITE_CDN_BASE_URL || "https://cdn.taskflow.com/";
    }
    return "/";
  };

  const cdnBaseUrl = getCDNBaseUrl();

  return {
    // ===== CDN CONFIGURATION =====
    // CDN base URL for assets
    base: cdnBaseUrl,

    // ===== PLUGINS =====
    // Vite plugin'leri - ek özellikler için
    plugins: [
      // React plugin - JSX transform, Fast Refresh, React DevTools desteği
      // Fast Refresh ve JSX runtime otomatik olarak aktif edilir
      react({
        // Babel plugin'leri (gerekirse eklenebilir)
        // babel: {
        //   plugins: [
        //     // '@babel/plugin-proposal-decorators',
        //     // '@babel/plugin-proposal-class-properties'
        //   ]
        // }
      }),

      // Bundle analyzer plugins - sadece production build'de veya ANALYZE=true durumunda aktif
      ...(mode === "production" || process.env.ANALYZE === "true"
        ? [
            // Rollup Visualizer - İnteraktif bundle analizi
            visualizer({
              filename: "dist/stats.html",
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: "treemap", // treemap, sunburst, network
              title: "TaskFlow Bundle Analysis",
              projectRoot: process.cwd(),
            }),
          ]
        : []),
    ],

    // ===== DEVELOPMENT SERVER =====
    server: {
      // Development server portu
      port: 3000,

      // Otomatik tarayıcı açma
      open: true,

      // Host ayarı (network'ten erişim için)
      // host: true, // Tüm network interface'lerden erişim

      // CORS ayarları (CDN için)
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },

      // Proxy ayarları (backend API istekleri için)
      // proxy: {
      //   '/api': {
      //     target: 'https://localhost:7047', // Backend API URL'i
      //     changeOrigin: true,
      //     secure: false, // HTTPS sertifika kontrolünü atla
      //     rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      // }
    },

    // ===== BUILD CONFIGURATION =====
    build: {
      // Build output directory
      outDir: "dist",

      // Asset'lerin göreceli yolu
      assetsDir: "assets",

      // Source map oluştur (debugging için)
      sourcemap: isDevelopment,

      // CDN optimization
      cssCodeSplit: true,
      manifest: true, // Generate manifest for CDN deployment

      // Bundle analysis optimization
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            // Vendor chunks
            "vendor-react": ["react", "react-dom"],
            "vendor-router": ["react-router-dom"],
            "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
            "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
            "vendor-ui": ["react-hot-toast"],
            "vendor-http": ["axios", "@tanstack/react-query"],
          },

          // Asset file naming with CDN optimization
          chunkFileNames: () => {
            return `js/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split(".");
            const ext = info?.[info.length - 1];

            // CDN-optimized file structure
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext || "")) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(ext || "")) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext || "")) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          entryFileNames: `js/[name]-[hash].js`,
        },
      },

      // Chunk boyut uyarı limiti (KB)
      chunkSizeWarningLimit: 1000,

      // Asset inline limiti (byte) - küçük dosyalar base64 olarak inline edilir
      assetsInlineLimit: 4096,

      // Build performance optimization
      target: "esnext",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
    },

    // ===== RESOLVE CONFIGURATION =====
    resolve: {
      // Path alias'ları (import path'lerini kısaltmak için)
      alias: {
        // '@' alias'ı src klasörünü işaret eder
        "@": "/src",

        // Component'ler için kısayol
        "@components": "/src/components",

        // Pages için kısayol
        "@pages": "/src/pages",

        // Types için kısayol
        "@types": "/src/types",

        // Utils için kısayol
        "@utils": "/src/utils",

        // Services için kısayol
        "@services": "/src/services",

        // Hooks için kısayol
        "@hooks": "/src/hooks",

        // Contexts için kısayol
        "@contexts": "/src/contexts",
      },
    },

    // ===== ENVIRONMENT VARIABLES =====
    // Environment variable prefix
    envPrefix: "VITE_",

    // Define global constants
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
      __CDN_BASE_URL__: JSON.stringify(cdnBaseUrl),
    },

    // ===== CSS CONFIGURATION =====
    css: {
      // PostCSS konfigürasyonu (postcss.config.js dosyasından alınır)
      postcss: "./postcss.config.js",

      // CSS modules ayarları
      modules: {
        // CSS modules naming pattern
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },

      // CSS preprocessor ayarları
      preprocessorOptions: {
        // Sass/SCSS ayarları
        scss: {
          // Global SCSS variables
          additionalData: `@import "./src/styles/variables.scss";`,
        },
      },
    },

    // ===== OPTIMIZATION =====
    optimizeDeps: {
      // Pre-bundle edilecek dependency'ler
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "react-hook-form",
        "@hookform/resolvers",
        "zod",
        "axios",
      ],

      // Exclude edilecek dependency'ler
      exclude: [
        // Büyük library'ler gerekirse exclude edilebilir
      ],
    },

    // ===== PREVIEW SERVER =====
    preview: {
      port: 4173,
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    },
  };
});
