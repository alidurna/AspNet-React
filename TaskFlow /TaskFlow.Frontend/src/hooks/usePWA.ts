/**
 * PWA Hook - Progressive Web App functionality
 * Service Worker registration, install prompt, offline detection
 */

import { useState, useEffect, useCallback } from "react";

// PWA Event Types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// PWA State Interface
interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

// PWA Actions Interface
interface PWAActions {
  promptInstall: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
  showInstallBanner: () => void;
  hideInstallBanner: () => void;
}

// Custom Hook
export const usePWA = (): PWAState & PWAActions => {
  // State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Service Worker Registration
  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        console.log("🔄 Registering Service Worker...");

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none", // Always check for updates
        });

        setServiceWorkerRegistration(registration);
        console.log("✅ Service Worker registered successfully");

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("🔄 Service Worker update found");

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("📦 New Service Worker available");
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Check for existing waiting service worker
        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        return registration;
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
        throw error;
      }
    } else {
      console.warn("⚠️ Service Workers not supported");
      throw new Error("Service Workers not supported");
    }
  }, []);

  // Update Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (serviceWorkerRegistration?.waiting) {
      try {
        console.log("🔄 Updating Service Worker...");

        // Send skip waiting message
        serviceWorkerRegistration.waiting.postMessage({ type: "SKIP_WAITING" });

        // Wait for controlling worker change
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("🔄 Service Worker updated, reloading...");
          window.location.reload();
        });

        setUpdateAvailable(false);
      } catch (error) {
        console.error("❌ Service Worker update failed:", error);
        throw error;
      }
    }
  }, [serviceWorkerRegistration]);

  // Install Prompt
  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        console.log("📱 Showing install prompt...");

        // Show install prompt
        await deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`📱 Install prompt result: ${outcome}`);

        if (outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error("❌ Install prompt failed:", error);
        throw error;
      }
    } else {
      console.warn("⚠️ Install prompt not available");
    }
  }, [deferredPrompt]);

  // Show Install Banner
  const showInstallBanner = useCallback(() => {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.style.display = "block";
    }
  }, []);

  // Hide Install Banner
  const hideInstallBanner = useCallback(() => {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.style.display = "none";
    }
  }, []);

  // Check if app is installed
  const checkIfInstalled = useCallback(() => {
    // Check if running in standalone mode
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isIOSStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

    return isStandalone || isIOSStandalone;
  }, []);

  // Effects
  useEffect(() => {
    // Register Service Worker - Geçici olarak devre dışı
    // registerServiceWorker().catch(console.error);

    // Check if app is already installed
    setIsInstalled(checkIfInstalled());

    // Listen for online/offline events
    const handleOnline = () => {
      console.log("🌐 App came online");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("📱 App went offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      console.log("📱 Before install prompt event fired");

      // Prevent default browser install prompt
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("✅ App was installed");
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [registerServiceWorker, checkIfInstalled]);

  // Listen for service worker messages
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case "CACHE_UPDATED":
              console.log("📦 Cache updated");
              break;
            case "OFFLINE_READY":
              console.log("📱 Offline ready");
              break;
            case "NEW_CONTENT_AVAILABLE":
              console.log("🔄 New content available");
              setUpdateAvailable(true);
              break;
            default:
              break;
          }
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  return {
    // State
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    serviceWorkerRegistration,

    // Actions
    promptInstall,
    updateServiceWorker,
    showInstallBanner,
    hideInstallBanner,
  };
};

// PWA Utilities
export const PWAUtils = {
  // Check if running in PWA mode
  isPWA: (): boolean => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isIOSStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;
    return isStandalone || isIOSStandalone;
  },

  // Check if device supports PWA
  supportsPWA: (): boolean => {
    return "serviceWorker" in navigator && "PushManager" in window;
  },

  // Get install status
  getInstallStatus: (): "not-installable" | "installable" | "installed" => {
    if (PWAUtils.isPWA()) return "installed";
    if (PWAUtils.supportsPWA()) return "installable";
    return "not-installable";
  },

  // Request notification permission
  requestNotificationPermission: async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      console.log("📢 Notification permission:", permission);
      return permission;
    }
    return "denied";
  },

  // Show notification
  showNotification: (title: string, options?: NotificationOptions): void => {
    if ("Notification" in window && Notification.permission === "granted") {
      const defaultOptions: NotificationOptions = {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        ...options,
      };

      new Notification(title, defaultOptions);
    }
  },

  // Clear all caches
  clearAllCaches: async (): Promise<void> => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log("🗑️ All caches cleared");
    }
  },

  // Get cache info
  getCacheInfo: async (): Promise<{ name: string; size: number }[]> => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return cacheInfo;
    }
    return [];
  },
};

export default usePWA;
