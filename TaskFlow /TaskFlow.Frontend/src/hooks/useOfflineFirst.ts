/**
 * Offline First Hook - Refactored
 * 
 * Offline-first functionality için ana hook.
 * Modüler utilities kullanır.
 * 
 * @version 2.0.0 - Modular
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage } from './offline/offlineStorage';
import { OfflineSyncManager } from './offline/offlineSync';
import type { 
  OfflineConfig, 
  OfflineState, 
  UseOfflineFirstReturn,
  PendingOperation,
  ConnectionQuality,
  StorageUsage
} from './offline/offlineTypes';

/**
 * Default offline configuration
 */
const defaultConfig: OfflineConfig = {
  enableSync: true,
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  enableBackground: true,
  enableNotifications: true,
  storageQuota: 50 * 1024 * 1024, // 50MB
  compressionLevel: 6
};

/**
 * Offline First Hook - Refactored
 */
export const useOfflineFirst = (config: Partial<OfflineConfig> = {}): UseOfflineFirstReturn => {
  const fullConfig = { ...defaultConfig, ...config };
  const syncManagerRef = useRef<OfflineSyncManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // State
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineReady: false,
    syncStatus: {
      isActive: false,
      progress: 0,
      currentOperation: null,
      error: null,
      completedOperations: 0,
      totalOperations: 0
    },
    pendingOperations: [],
    lastSyncTime: null,
    storageUsage: {
      used: 0,
      available: 0,
      quota: 0,
      percentage: 0
    },
    connectionQuality: navigator.onLine ? 'excellent' : 'offline'
  });

  /**
   * Initialize offline functionality
   */
  const initialize = useCallback(async () => {
    try {
      await offlineStorage.init();
      
      syncManagerRef.current = new OfflineSyncManager(fullConfig);
      
      // Listen to sync status changes
      const unsubscribe = syncManagerRef.current.addListener((syncStatus) => {
        setState(prev => ({ ...prev, syncStatus }));
      });

      // Load pending operations
      const pendingOperations = await offlineStorage.getPendingOperations();
      const storageUsage = await offlineStorage.getStorageUsage();

      setState(prev => ({
        ...prev,
        isOfflineReady: true,
        pendingOperations,
        storageUsage
      }));

      // Start auto sync if enabled
      if (fullConfig.enableSync) {
        syncManagerRef.current.startAutoSync();
      }

      setIsInitialized(true);

      return () => {
        unsubscribe();
        syncManagerRef.current?.stopAutoSync();
      };
    } catch (error) {
      console.error('Failed to initialize offline functionality:', error);
    }
  }, [fullConfig]);

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ 
        ...prev, 
        isOnline: true, 
        connectionQuality: 'excellent' 
      }));
      
      // Trigger sync when coming back online
      if (syncManagerRef.current && fullConfig.enableSync) {
        syncManagerRef.current.syncPendingOperations();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        connectionQuality: 'offline' 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fullConfig.enableSync]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Actions
   */
  const enableOfflineMode = useCallback(async () => {
    if (!isInitialized) return;
    
    setState(prev => ({ ...prev, isOfflineReady: true }));
    
    if (syncManagerRef.current && fullConfig.enableSync) {
      syncManagerRef.current.startAutoSync();
    }
  }, [isInitialized, fullConfig.enableSync]);

  const disableOfflineMode = useCallback(async () => {
    setState(prev => ({ ...prev, isOfflineReady: false }));
    syncManagerRef.current?.stopAutoSync();
  }, []);

  const syncData = useCallback(async () => {
    if (!syncManagerRef.current || !state.isOnline) return;
    await syncManagerRef.current.syncPendingOperations();
  }, [state.isOnline]);

  const clearOfflineData = useCallback(async () => {
    await offlineStorage.clearAll();
    setState(prev => ({
      ...prev,
      pendingOperations: [],
      lastSyncTime: null
    }));
  }, []);

  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0
    };

    offlineStorage.storePendingOperation(newOperation);
    setState(prev => ({
      ...prev,
      pendingOperations: [...prev.pendingOperations, newOperation]
    }));
  }, []);

  const removePendingOperation = useCallback(async (id: string) => {
    await offlineStorage.removePendingOperation(id);
    setState(prev => ({
      ...prev,
      pendingOperations: prev.pendingOperations.filter(op => op.id !== id)
    }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<OfflineConfig>) => {
    const updatedConfig = { ...fullConfig, ...newConfig };
    syncManagerRef.current?.updateConfig(updatedConfig);
  }, [fullConfig]);

  const getStorageInfo = useCallback(async (): Promise<StorageUsage> => {
    const storageUsage = await offlineStorage.getStorageUsage();
    setState(prev => ({ ...prev, storageUsage }));
    return storageUsage;
  }, []);

  return {
    // State
    ...state,
    isInitialized,
    
    // Actions
    enableOfflineMode,
    disableOfflineMode,
    syncData,
    clearOfflineData,
    addPendingOperation,
    removePendingOperation,
    updateConfig,
    getStorageInfo
  };
};

export default useOfflineFirst; 