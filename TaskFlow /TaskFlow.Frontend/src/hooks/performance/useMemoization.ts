/**
 * Memoization Hooks
 * 
 * Memoization ile performans optimizasyonu sağlayan custom hooks.
 */

import { useCallback, useMemo, useRef } from "react";

/**
 * useMemoized - Expensive computation memoization
 * 
 * Pahalı hesaplamaları memoize ederek performans optimizasyonu sağlar.
 * Dependencies değişmediği sürece cached değeri döndürür.
 * 
 * @param computeFn - Hesaplama fonksiyonu
 * @param dependencies - Dependency array
 * @returns Memoized değer
 */
export const useMemoized = <T>(
  computeFn: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(computeFn, dependencies);
};

/**
 * useMemoizedCallback - Callback memoization
 * 
 * Callback fonksiyonlarını memoize ederek gereksiz re-render'ları önler.
 * Child component'lere prop olarak geçirilen fonksiyonlar için idealdir.
 * 
 * @param callback - Memoize edilecek callback
 * @param dependencies - Dependency array
 * @returns Memoized callback
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

/**
 * useDeepMemo - Deep comparison memoization
 * 
 * Derin karşılaştırma ile memoization yapar.
 * Object ve array dependencies için kullanışlıdır.
 * 
 * @param computeFn - Hesaplama fonksiyonu
 * @param dependencies - Dependency array
 * @returns Memoized değer
 */
export const useDeepMemo = <T>(
  computeFn: () => T,
  dependencies: any[]
): T => {
  const depsRef = useRef<any[]>();
  const resultRef = useRef<T>();

  // Deep comparison helper
  const deepEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (typeof a[i] === 'object' && typeof b[i] === 'object') {
        if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
      } else if (a[i] !== b[i]) {
        return false;
      }
    }
    
    return true;
  };

  if (!depsRef.current || !deepEqual(depsRef.current, dependencies)) {
    depsRef.current = dependencies;
    resultRef.current = computeFn();
  }

  return resultRef.current!;
};

/**
 * useMemoizedSelector - State selector memoization
 * 
 * State selector'larını memoize ederek performans optimizasyonu sağlar.
 * Redux store'dan veri seçimi için idealdir.
 * 
 * @param selector - Selector fonksiyonu
 * @param state - State objesi
 * @returns Memoized selected değer
 */
export const useMemoizedSelector = <TState, TSelected>(
  selector: (state: TState) => TSelected,
  state: TState
): TSelected => {
  return useMemo(() => selector(state), [selector, state]);
};

/**
 * useStableMemo - Stable reference memoization
 * 
 * Referans kararlılığı sağlayan memoization hook'u.
 * Object ve array oluştururken kullanışlıdır.
 * 
 * @param factory - Factory fonksiyonu
 * @param dependencies - Dependency array
 * @returns Stable reference
 */
export const useStableMemo = <T>(
  factory: () => T,
  dependencies: React.DependencyList
): T => {
  const memoizedValue = useMemo(factory, dependencies);
  const stableRef = useRef<T>(memoizedValue);

  // Sadece değer gerçekten değiştiyse referansı güncelle
  if (memoizedValue !== stableRef.current) {
    stableRef.current = memoizedValue;
  }

  return stableRef.current;
};

/**
 * useComputedValue - Computed value with caching
 * 
 * Hesaplanmış değerleri cache'leyerek performans optimizasyonu sağlar.
 * Vue.js'teki computed properties benzeri davranış sağlar.
 * 
 * @param computeFn - Hesaplama fonksiyonu
 * @param dependencies - Dependency array
 * @param shouldUpdate - Güncelleme koşulu (opsiyonel)
 * @returns Computed değer ve invalidate fonksiyonu
 */
export const useComputedValue = <T>(
  computeFn: () => T,
  dependencies: React.DependencyList,
  shouldUpdate?: (prev: T, next: T) => boolean
) => {
  const prevDepsRef = useRef<React.DependencyList>();
  const valueRef = useRef<T>();
  const isInitialRef = useRef(true);

  const hasChanged = useMemo(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return true;
    }

    if (!prevDepsRef.current) return true;
    
    return dependencies.some((dep, index) => 
      dep !== prevDepsRef.current![index]
    );
  }, dependencies);

  if (hasChanged) {
    const newValue = computeFn();
    
    if (!shouldUpdate || !valueRef.current || shouldUpdate(valueRef.current, newValue)) {
      valueRef.current = newValue;
    }
    
    prevDepsRef.current = dependencies;
  }

  const invalidate = useCallback(() => {
    prevDepsRef.current = undefined;
    valueRef.current = undefined;
  }, []);

  return {
    value: valueRef.current!,
    invalidate,
  };
}; 