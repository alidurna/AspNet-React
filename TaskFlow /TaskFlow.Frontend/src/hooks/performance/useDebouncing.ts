/**
 * Debouncing Hooks
 * 
 * Debouncing ile performans optimizasyonu sağlayan custom hooks.
 */

import { useCallback, useRef, useEffect, useState } from "react";

/**
 * useDebounce - Değer debouncing hook'u
 * 
 * Belirli bir değerin değişimini geciktirerek gereksiz işlemleri önler.
 * Özellikle arama inputları ve API çağrıları için kullanışlıdır.
 * 
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme süresi (ms)
 * @returns Debounced değer
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebouncedCallback - Callback debouncing hook'u
 * 
 * Callback fonksiyonlarını debounce ederek performans optimizasyonu sağlar.
 * Form validasyonu ve kullanıcı etkileşimleri için idealdir.
 * 
 * @param callback - Debounce edilecek callback
 * @param delay - Gecikme süresi (ms)
 * @returns Debounced callback
 */
export const useDebouncedCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * useDebouncedSearch - Arama için özelleştirilmiş debouncing
 * 
 * Arama işlemleri için optimize edilmiş debouncing hook'u.
 * Minimum karakter sayısı ve loading durumu yönetimi içerir.
 * 
 * @param searchFn - Arama fonksiyonu
 * @param delay - Gecikme süresi (ms)
 * @param minLength - Minimum karakter sayısı
 * @returns Arama durumu ve fonksiyonları
 */
export const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300,
  minLength: number = 2
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < minLength) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFn(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Arama hatası');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFn, minLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}; 