/**
 * Offline Sync Manager
 * 
 * Offline data synchronization logic.
 */

import { offlineStorage } from './offlineStorage';
import type { PendingOperation, SyncStatus, OfflineConfig } from './offlineTypes';

export class OfflineSyncManager {
  private config: OfflineConfig;
  private syncStatus: SyncStatus = {
    isActive: false,
    progress: 0,
    currentOperation: null,
    error: null,
    completedOperations: 0,
    totalOperations: 0
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor(config: OfflineConfig) {
    this.config = config;
  }

  /**
   * Add sync status listener
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifyListeners();
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncStatus.isActive) {
        this.syncPendingOperations();
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending operations
   */
  async syncPendingOperations(): Promise<void> {
    if (this.syncStatus.isActive) return;
    
    try {
      const operations = await offlineStorage.getPendingOperations();
      if (operations.length === 0) return;

      this.updateSyncStatus({
        isActive: true,
        progress: 0,
        error: null,
        completedOperations: 0,
        totalOperations: operations.length
      });

      // Sort by priority and timestamp
      const sortedOperations = operations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });

      for (let i = 0; i < sortedOperations.length; i++) {
        const operation = sortedOperations[i];
        
        this.updateSyncStatus({
          currentOperation: `${operation.type}: ${operation.id}`,
          progress: (i / sortedOperations.length) * 100
        });

        try {
          await this.syncOperation(operation);
          await offlineStorage.removePendingOperation(operation.id);
          
          this.updateSyncStatus({
            completedOperations: i + 1
          });
        } catch (error) {
          console.error('Sync operation failed:', error);
          
          // Increment retry count
          operation.retryCount++;
          
          if (operation.retryCount >= this.config.maxRetries) {
            // Remove operation after max retries
            await offlineStorage.removePendingOperation(operation.id);
            console.warn('Operation removed after max retries:', operation.id);
          } else {
            // Update operation with new retry count
            await offlineStorage.storePendingOperation(operation);
          }
        }
      }

      this.updateSyncStatus({
        isActive: false,
        progress: 100,
        currentOperation: null,
        completedOperations: sortedOperations.length
      });

    } catch (error) {
      this.updateSyncStatus({
        isActive: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        currentOperation: null
      });
    }
  }

  /**
   * Sync individual operation
   */
  private async syncOperation(operation: PendingOperation): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Here you would implement actual API calls
    switch (operation.type) {
      case 'create':
        // await api.create(operation.data);
        break;
      case 'update':
        // await api.update(operation.data.id, operation.data);
        break;
      case 'delete':
        // await api.delete(operation.data.id);
        break;
      case 'sync':
        // await api.sync(operation.data);
        break;
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart auto sync if interval changed
    if (newConfig.syncInterval && this.syncInterval) {
      this.stopAutoSync();
      this.startAutoSync();
    }
  }
} 