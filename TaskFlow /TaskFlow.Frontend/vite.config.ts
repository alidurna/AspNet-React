import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
export default defineConfig({
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
  ],

  // ===== DEVELOPMENT SERVER =====
  server: {
    // Development server portu
    port: 3000,

    // Otomatik tarayıcı açma
    open: true,

    // Host ayarı (network'ten erişim için)
    // host: true, // Tüm network interface'lerden erişim

    // CORS ayarları (backend API için)
    // cors: true,

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
    sourcemap: true,

    // Bundle analyzer (gerekirse)
    // rollupOptions: {
    //   plugins: [
    //     // Bundle analyzer plugin
    //   ]
    // },

    // Chunk boyut uyarı limiti (KB)
    chunkSizeWarningLimit: 1000,

    // Asset inline limiti (byte) - küçük dosyalar base64 olarak inline edilir
    assetsInlineLimit: 4096,
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
      // SCSS ayarları (gerekirse)
      // scss: {
      //   additionalData: `@import "@/styles/variables.scss";`
      // }
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
  // Production build'i preview etmek için
  preview: {
    port: 4173,
    open: true,
  },
});
