/**
 * Environment Configuration
 * 
 * Uygulama genelinde kullanılan environment değişkenlerini
 * merkezi olarak yöneten konfigürasyon dosyası.
 * 
 * OAuth, API URL'leri, feature flag'ler ve diğer
 * environment-specific ayarları içerir.
 */

export const environment = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281/api',
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    },
    apple: {
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.taskflow.app',
      teamId: import.meta.env.VITE_APPLE_TEAM_ID || 'your-apple-team-id',
      keyId: import.meta.env.VITE_APPLE_KEY_ID || 'your-apple-key-id',
    },
    microsoft: {
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
      clientSecret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
      redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:3001/auth/microsoft/callback',
    },
  },
  
  // Application Settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'TaskFlow',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Modern Task Management Application',
  },
  
  // Feature Flags
  features: {
    enableSocialLogin: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true',
    enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Development Settings
  development: {
    enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};

/**
 * OAuth Provider URLs
 */
export const oauthUrls = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
  apple: {
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
  },
};

/**
 * OAuth Scopes
 */
export const oauthScopes = {
  google: [
    'openid',
    'profile',
    'email',
  ],
  apple: [
    'name',
    'email',
  ],
  microsoft: [
    'openid',
    'profile',
    'email',
    'User.Read',
  ],
};

export default environment;
