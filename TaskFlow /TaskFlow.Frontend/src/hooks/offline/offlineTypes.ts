/**
 * Offline First Types
 * 
 * Offline functionality için type definitions.
 */

export interface OfflineConfig {
  enableSync: boolean;
  syncInterval: number;
  maxRetries: number;
  retryDelay: number;
  enableBackground: boolean;
  enableNotifications: boolean;
  storageQuota: number;
  compressionLevel: number;
}

export interface OfflineState {
  isOnline: boolean;
  isOfflineReady: boolean;
  syncStatus: SyncStatus;
  pendingOperations: PendingOperation[];
  lastSyncTime: Date | null;
  storageUsage: StorageUsage;
  connectionQuality: ConnectionQuality;
}

export interface SyncStatus {
  isActive: boolean;
  progress: number;
  currentOperation: string | null;
  error: string | null;
  completedOperations: number;
  totalOperations: number;
}

export interface PendingOperation {
  id: string;
  type: OperationType;
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: OperationPriority;
}

export interface StorageUsage {
  used: number;
  available: number;
  quota: number;
  percentage: number;
}

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'offline';
export type OperationType = 'create' | 'update' | 'delete' | 'sync';
export type OperationPriority = 'high' | 'medium' | 'low';

export interface OfflineActions {
  enableOfflineMode: () => Promise<void>;
  disableOfflineMode: () => Promise<void>;
  syncData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingOperation: (id: string) => void;
  updateConfig: (config: Partial<OfflineConfig>) => void;
  getStorageInfo: () => Promise<StorageUsage>;
}

export interface UseOfflineFirstReturn extends OfflineState, OfflineActions {
  isInitialized: boolean;
} 