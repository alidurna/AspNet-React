/**
 * useOptimisticUpdate Custom Hook
 *
 * Bu dosya, TaskFlow uygulamasında optimistic UI updates
 * için kullanılan custom hook'u içerir. Kullanıcı deneyimini
 * iyileştirmek için UI'ı hemen günceller, sonra backend'den
 * doğrulama alır.
 *
 * Ana Özellikler:
 * - Anında UI güncellemesi
 * - Backend doğrulama
 * - Hata durumunda rollback
 * - Loading state yönetimi
 * - Error handling
 *
 * Kullanım Alanları:
 * - Form submissions
 * - CRUD operations
 * - Like/favorite actions
 * - Status updates
 * - Real-time interactions
 *
 * Optimistic Updates:
 * - UI hemen güncellenir
 * - Backend request arka planda çalışır
 * - Başarılı olursa kalıcı olur
 * - Başarısız olursa eski haline döner
 *
 * Error Handling:
 * - Network errors
 * - Validation errors
 * - Server errors
 * - Timeout handling
 * - Retry mechanism
 *
 * Performance:
 * - Immediate feedback
 * - Reduced perceived latency
 * - Better user experience
 * - Efficient state management
 *
 * Sürdürülebilirlik:
 * - TypeScript tip güvenliği
 * - Modüler yapı
 * - Açık ve anlaşılır kod
 * - Comprehensive documentation
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Optimistic Update Options Interface
 */
interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData: T) => void;
  onSettled?: () => void;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Optimistic Update Result Interface
 */
interface OptimisticUpdateResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  updateOptimistically: (updater: (data: T) => T, asyncOperation: () => Promise<T>) => Promise<void>;
  rollback: () => void;
  retry: () => void;
}

/**
 * Optimistic List Result Interface
 */
interface OptimisticListResult<T> extends OptimisticUpdateResult<T[]> {
  updateItem: (id: string | number, updater: (item: T) => T, asyncOperation: () => Promise<T[]>) => Promise<void>;
  addItem: (newItem: T, asyncOperation: () => Promise<T[]>) => Promise<void>;
  removeItem: (id: string | number, asyncOperation: () => Promise<T[]>) => Promise<void>;
}

/**
 * useOptimisticUpdate Custom Hook
 *
 * Optimistic UI updates için kullanılan hook.
 * UI'ı hemen günceller, sonra backend'den doğrulama alır.
 *
 * @param initialData - Başlangıç verisi
 * @param options - Optimistic update seçenekleri
 * @returns Optimistic update result
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
): OptimisticUpdateResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const originalDataRef = useRef<T>(initialData);
  const currentOperationRef = useRef<(() => Promise<T>) | null>(null);
  const retryCountRef = useRef(0);
  
  const {
    onSuccess,
    onError,
    onSettled,
    timeout = 10000,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  /**
   * Optimistic update fonksiyonu
   */
  const updateOptimistically = useCallback(async (
    updater: (data: T) => T,
    asyncOperation: () => Promise<T>
  ) => {
    try {
      // Orijinal veriyi kaydet
      originalDataRef.current = data;
      currentOperationRef.current = asyncOperation;
      retryCountRef.current = 0;
      
      // UI'ı hemen güncelle (optimistic)
      const optimisticData = updater(data);
      setData(optimisticData);
      setError(null);
      setIsLoading(true);

      // Backend request'i başlat
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      const result = await Promise.race([
        asyncOperation(),
        timeoutPromise
      ]);

      // Başarılı olursa veriyi güncelle
      setData(result);
      setIsLoading(false);
      onSuccess?.(result);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      
      // Hata durumunda eski veriye dön
      setData(originalDataRef.current);
      onError?.(error, originalDataRef.current);
    } finally {
      onSettled?.();
    }
  }, [data, timeout, onSuccess, onError, onSettled]);

  /**
   * Rollback fonksiyonu
   */
  const rollback = useCallback(() => {
    setData(originalDataRef.current);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Retry fonksiyonu
   */
  const retry = useCallback(async () => {
    if (!currentOperationRef.current || retryCountRef.current >= retryCount) {
      return;
    }

    retryCountRef.current++;
    setIsLoading(true);
    setError(null);

    try {
      // Retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      const result = await currentOperationRef.current();
      setData(result);
      setIsLoading(false);
      onSuccess?.(result);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Retry failed');
      setError(error);
      setIsLoading(false);
      
      if (retryCountRef.current >= retryCount) {
        // Son retry başarısız olursa rollback
        setData(originalDataRef.current);
        onError?.(error, originalDataRef.current);
      }
    }
  }, [retryCount, retryDelay, onSuccess, onError]);

  return {
    data,
    isLoading,
    error,
    updateOptimistically,
    rollback,
    retry
  };
}

/**
 * useOptimisticList Hook
 * Liste verileri için optimistic updates
 */
interface OptimisticListOptions<T> extends OptimisticUpdateOptions<T[]> {
  findItem?: (item: T, id: string | number) => boolean;
  getId?: (item: T) => string | number;
}

export function useOptimisticList<T>(
  initialData: T[],
  options: OptimisticListOptions<T> = {}
): OptimisticListResult<T> {
  const { findItem, getId } = options;
  
  const optimisticUpdate = useOptimisticUpdate(initialData, options);

  /**
   * Liste item'ını optimistic olarak güncelle
   */
  const updateItem = useCallback(async (
    id: string | number,
    updater: (item: T) => T,
    asyncOperation: () => Promise<T[]>
  ) => {
    const currentData = optimisticUpdate.data;
    const itemIndex = currentData.findIndex(item => 
      findItem ? findItem(item, id) : getId ? getId(item) === id : false
    );

    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const updatedData = [...currentData];
    updatedData[itemIndex] = updater(currentData[itemIndex]);

    await optimisticUpdate.updateOptimistically(
      () => updatedData,
      asyncOperation
    );
  }, [optimisticUpdate, findItem, getId]);

  /**
   * Liste item'ını optimistic olarak ekle
   */
  const addItem = useCallback(async (
    newItem: T,
    asyncOperation: () => Promise<T[]>
  ) => {
    await optimisticUpdate.updateOptimistically(
      (data) => [...data, newItem],
      asyncOperation
    );
  }, [optimisticUpdate]);

  /**
   * Liste item'ını optimistic olarak sil
   */
  const removeItem = useCallback(async (
    id: string | number,
    asyncOperation: () => Promise<T[]>
  ) => {
    const currentData = optimisticUpdate.data;
    const filteredData = currentData.filter(item => 
      findItem ? !findItem(item, id) : getId ? getId(item) !== id : false
    );

    await optimisticUpdate.updateOptimistically(
      () => filteredData,
      asyncOperation
    );
  }, [optimisticUpdate, findItem, getId]);

  return {
    ...optimisticUpdate,
    updateItem,
    addItem,
    removeItem
  };
} 