import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - büyük kütüphaneleri ayır
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'react-icons'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'date-vendor': ['date-fns'],
          'chart-vendor': ['recharts'],
          
          // Feature chunks - sayfa bazlı ayırım
          'auth-pages': [
            './src/pages/Login.tsx',
            './src/pages/Register.tsx', 
            './src/pages/ForgotPassword.tsx',
            './src/pages/ResetPassword.tsx'
          ],
          'main-pages': [
            './src/pages/Dashboard.tsx',
            './src/pages/Tasks.tsx',
            './src/pages/Profile.tsx',
            './src/pages/Categories.tsx'
          ],
          
          // API chunks - servis bazlı ayırım
          'api-services': [
            './src/services/api.ts',
            './src/services/features/authAPI.ts',
            './src/services/features/tasksAPI.ts',
            './src/services/features/categoriesAPI.ts'
          ]
        }
      }
    },
    // Bundle size uyarı limitini artır
    chunkSizeWarningLimit: 1000,
    // Source map'leri production'da devre dışı bırak
    sourcemap: false,
    // Minification optimize et
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log'ları production'da kaldır
        drop_debugger: true
      }
    }
  },
  // CSS code splitting
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  }
});
