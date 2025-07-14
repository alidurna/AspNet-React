// TaskFlow Service Worker
// PWA functionality için cache, offline support ve background sync

const CACHE_NAME = "taskflow-v1.0.0";
const API_CACHE_NAME = "taskflow-api-v1.0.0";
const STATIC_CACHE_NAME = "taskflow-static-v1.0.0";

let apiBaseUrl = ''; // API base URL'si buradan gelecek

// Cache edilecek statik dosyalar
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/src/App.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Offline fallback page
  "/offline.html",
];

// Cache edilecek API endpoint'leri
const API_ENDPOINTS = [
  "/api/users/profile",
  "/api/categories",
  "/api/todotasks/statistics",
];

// Cache stratejileri
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Service Worker Install Event
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    Promise.all([
      // Statik dosyaları cache'e al
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("📦 Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      }),

      // API cache'ini hazırla
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log("🌐 Preparing API cache...");
        return cache;
      }),
    ])
      .then(() => {
        console.log("✅ Service Worker installed successfully");
        // Eski service worker'ı hemen değiştir
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Service Worker installation failed:", error);
      })
  );
});

// Service Worker Activate Event
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    Promise.all([
      // Eski cache'leri temizle
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Tüm client'ları kontrol et
      self.clients.claim(),
    ])
      .then(() => {
        console.log("✅ Service Worker activated successfully");

        // Notification permission iste
        if ("Notification" in self && Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            console.log("📢 Notification permission:", permission);
          });
        }
      })
      .catch((error) => {
        console.error("❌ Service Worker activation failed:", error);
      })
  );
});

// Fetch Event - Network request'leri yakala
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece same-origin request'leri handle et
  if (url.origin !== location.origin) {
    return;
  }

  // API request'leri için ayrı strateji
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
  }
  // Statik dosyalar için cache-first
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

// API Request Handler
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE_NAME);
  let fullApiUrl = ''; // fullApiUrl'ı burada tanımlayarak scope dışı kalmasını önle

  try {
    // GET request'ler için stale-while-revalidate
    if (request.method === "GET") {
      const cachedResponse = await cache.match(request);

      // Cache'den cevap var, ama background'da güncelle
      if (cachedResponse) {
        console.log("📱 API Cache HIT:", url.pathname);

        // Background'da güncelle (doğrudan tam URL'ye istek at)
        fullApiUrl = `${apiBaseUrl}/api/v1.0${url.pathname.replace('/api', '')}`;
        console.log(`SW: Revalidate - Constructed fullApiUrl: ${fullApiUrl}`);
        fetch(fullApiUrl, { headers: request.headers })
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
          })
          .catch((error) => {
            console.warn("⚠️ Background update failed:", error);
          });

        return cachedResponse;
      }
    }

    // Network'ten al (doğrudan tam URL'ye istek at)
    console.log(`SW: Original API Request URL: ${request.url}`);
    fullApiUrl = `${apiBaseUrl}/api/v1.0${url.pathname.replace('/api', '')}`;
    console.log(`SW: Constructed fullApiUrl: ${fullApiUrl}`);
    const response = await fetch(fullApiUrl, { headers: request.headers });

    // Başarılı GET response'ları cache'e al
    if (response.ok && request.method === "GET") {
      console.log("🌐 API Network SUCCESS:", url.pathname);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("❌ API Request failed:", error);

    // Offline durumunda cache'den dön
    if (request.method === "GET") {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log("📱 API Offline fallback:", url.pathname);
        return cachedResponse;
      }
    }

    // Offline notification göster
    if (request.method === "POST" || request.method === "PUT") {
      showOfflineNotification();

      // Background sync'e ekle
      const requestToSync = new Request(fullApiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" ? await request.clone().text() : null,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
        keepalive: request.keepalive,
      });
      await addToBackgroundSync(requestToSync);
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Offline - veriler senkronize edilecek",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Static Request Handler
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);

  try {
    // Cache'den bak
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log("📦 Static Cache HIT:", request.url);
      return cachedResponse;
    }

    // Network'ten al
    const response = await fetch(request);

    // Başarılı response'ları cache'e al
    if (response.ok) {
      console.log("🌐 Static Network SUCCESS:", request.url);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("❌ Static Request failed:", error);

    // Offline fallback page
    if (request.mode === "navigate") {
      const offlineResponse = await cache.match("/offline.html");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response("Offline - İnternet bağlantınızı kontrol edin", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Background Sync Event
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "taskflow-sync") {
    event.waitUntil(performBackgroundSync());
  }
});

// Background Sync İşlemi
async function performBackgroundSync() {
  try {
    const pendingRequests = await getPendingRequests();

    for (const requestData of pendingRequests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body,
        });

        if (response.ok) {
          console.log("✅ Background sync success:", requestData.url);
          await removePendingRequest(requestData.id);

          // Başarı notification'ı göster
          showSyncSuccessNotification();
        }
      } catch (error) {
        console.error("❌ Background sync failed:", error);
      }
    }
  } catch (error) {
    console.error("❌ Background sync process failed:", error);
  }
}

// Background Sync'e Request Ekle
async function addToBackgroundSync(request) {
  try {
    const requestData = {
      id: Date.now().toString(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== "GET" ? await request.text() : null,
      timestamp: new Date().toISOString(),
    };

    // IndexedDB'ye kaydet
    await saveToIndexedDB("pending-requests", requestData);

    // Background sync register et
    await self.registration.sync.register("taskflow-sync");

    console.log("📝 Request added to background sync:", requestData.url);
  } catch (error) {
    console.error("❌ Failed to add request to background sync:", error);
  }
}

// Push Notification Event
self.addEventListener("push", (event) => {
  console.log("📢 Push notification received");

  const options = {
    body: "TaskFlow'da yeni bir bildirim var!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Görüntüle",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Kapat",
        icon: "/icons/xmark.png",
      },
    ],
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(self.registration.showNotification("TaskFlow", options));
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"));
  } else if (event.action === "close") {
    // Sadece notification'ı kapat
    return;
  } else {
    // Varsayılan action - uygulamayı aç
    event.waitUntil(clients.openWindow("/"));
  }
});

// Utility Functions
async function showOfflineNotification() {
  if ("Notification" in self && Notification.permission === "granted") {
    new Notification("TaskFlow - Offline", {
      body: "İnternet bağlantınız kesildi. Veriler senkronize edilecek.",
      icon: "/icons/icon-192x192.png",
    });
  }
}

async function showSyncSuccessNotification() {
  if ("Notification" in self && Notification.permission === "granted") {
    new Notification("TaskFlow - Senkronize Edildi", {
      body: "Offline verileriniz başarıyla senkronize edildi.",
      icon: "/icons/icon-192x192.png",
    });
  }
}

// IndexedDB Helper Functions
async function saveToIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TaskFlowDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.add(data);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
  });
}

async function getPendingRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TaskFlowDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("pending-requests", "readonly");
      const store = transaction.objectStore("pending-requests");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removePendingRequest(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TaskFlowDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("pending-requests", "readwrite");
      const store = transaction.objectStore("pending-requests");
      store.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_API_BASE_URL') {
    apiBaseUrl = event.data.url;
    console.log(`Service Worker: API Base URL set to ${apiBaseUrl}`);
  }
});

console.log("📱 TaskFlow Service Worker loaded successfully");
