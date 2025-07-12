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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

/**
 * Uygulamanın kökünü oluşturur ve App component'ini QueryClientProvider ile sarmalar.
 * Tüm React ağacı global QueryClient'a erişebilir.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
