// ****************************************************************************************************
//  MAIN.TSX
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının React giriş noktasıdır. Uygulamanın kökünü oluşturur ve
//  global provider'ları (QueryClientProvider, StrictMode) ile App component'ini sarmalar.
//  React 18 createRoot API kullanarak modern React uygulaması başlatma işlemini yönetir.
//
//  ANA BAŞLIKLAR:
//  - React Application Bootstrap
//  - Global Provider Setup
//  - QueryClient Configuration
//  - StrictMode Implementation
//  - CSS Import ve Styling
//  - Error Boundary Setup
//
//  GÜVENLİK:
//  - StrictMode development checks
//  - QueryClient security
//  - Provider isolation
//  - Error boundary protection
//  - Memory leak prevention
//
//  HATA YÖNETİMİ:
//  - React error boundaries
//  - Query error handling
//  - Provider initialization errors
//  - DOM mounting failures
//  - Graceful error recovery
//
//  EDGE-CASE'LER:
//  - DOM element not found
//  - Provider initialization failures
//  - QueryClient configuration errors
//  - StrictMode double rendering
//  - Memory leak scenarios
//  - Browser compatibility issues
//  - Network connectivity problems
//
//  YAN ETKİLER:
//  - Provider setup affects global state
//  - QueryClient affects data fetching
//  - StrictMode affects development experience
//  - CSS import affects styling
//  - Error boundaries affect error handling
//
//  PERFORMANS:
//  - Efficient provider initialization
//  - Optimized query caching
//  - Minimal bundle size
//  - Fast application startup
//  - Memory management optimization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear bootstrap structure
//  - Comprehensive documentation
//  - Extensible provider system
//  - Modular architecture
//  - Configuration-based flexibility
// ****************************************************************************************************
/**
 * main.tsx
 *
 * React uygulamasının giriş noktasıdır. Uygulamanın kökünü oluşturur ve
 * global sağlayıcıları (QueryClientProvider, StrictMode) ile App component'ini sarmalar.
 *
 * - React 18 createRoot API kullanılır.
 * - React Query için QueryClientProvider ile global cache yönetimi sağlanır.
 * - Tüm uygulama StrictMode ile geliştirme modunda ek kontrollerle çalışır.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx"; // Eklendi
import environment from "./config/environment"; // Environment config import edildi

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux"; // Provider import edildi
import { store } from "./store"; // Redux store import edildi

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      gcTime: 1000 * 60 * 10, // 10 dakika (önceki default'tan biraz daha uzun)
    },
  },
});

/**
 * Uygulamanın kökünü oluşturur ve App component'ini QueryClientProvider ile sarmalar.
 * Tüm React ağacı global QueryClient'a erişebilir.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}> {/* Redux Provider eklendi */}
        <ErrorBoundary> {/* ErrorBoundary ile App'i sararız */}
          <App />
        </ErrorBoundary>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);

// Service Worker Registration
if ("serviceWorker" in navigator) {
  const config = environment; // Değiştirildi
  const apiBaseUrlForSw = config.apiBaseUrl;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
        // Service Worker'a API base URL'sini gönder
        if (registration.active) {
          registration.active.postMessage({
            type: "SET_API_BASE_URL",
            url: apiBaseUrlForSw,
          });
        }
      })
      .catch((error) => {
        console.log("ServiceWorker registration failed: ", error);
      });
  });
}
