import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * TaskFlow Uygulaması Entry Point (Giriş Noktası)
 *
 * Bu dosya, React uygulamasının başlatıldığı ana dosyadır.
 * Vite tarafından otomatik olarak yüklenir ve uygulamayı DOM'a render eder.
 *
 * İmport Edilen Modüller:
 * - StrictMode: React'in geliştirme modunda ek kontroller yapması için
 * - createRoot: React 18'in yeni root API'si
 * - index.css: Global CSS stilleri (Tailwind CSS dahil)
 * - App: Ana uygulama component'i
 *
 * StrictMode Faydaları:
 * - Deprecated API'lerin kullanımını tespit eder
 * - Side effect'leri kontrol eder
 * - Unsafe lifecycle method'ları uyarır
 * - Development modunda component'leri 2 kez render eder (bug tespiti için)
 *
 * createRoot vs ReactDOM.render:
 * - React 18'de ReactDOM.render deprecated oldu
 * - createRoot, concurrent rendering özelliklerini destekler
 * - Daha iyi performans ve user experience sağlar
 */

// HTML'deki 'root' element'ini bulup React root'u oluştur
// '!' operatörü TypeScript'e element'in kesinlikle var olduğunu söyler
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Ana uygulama component'ini render et */}
    <App />
  </StrictMode>
);
