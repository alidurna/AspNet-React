/**
 * Throttling Hooks
 * 
 * Throttling ile performans optimizasyonu sağlayan custom hooks.
 */

import { useCallback, useRef, useEffect, useState } from "react";

/**
 * useThrottle - Değer throttling hook'u
 * 
 * Belirli bir değerin güncellenmesini sınırlayarak performans optimizasyonu sağlar.
 * Scroll ve resize eventları için idealdir.
 * 
 * @param value - Throttle edilecek değer
 * @param limit - Limit süresi (ms)
 * @returns Throttled değer
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * useThrottledCallback - Callback throttling hook'u
 * 
 * Callback fonksiyonlarını throttle ederek performans optimizasyonu sağlar.
 * Event handler'lar ve API çağrıları için kullanışlıdır.
 * 
 * @param callback - Throttle edilecek callback
 * @param limit - Limit süresi (ms)
 * @returns Throttled callback
 */
export const useThrottledCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  limit: number
) => {
  const inThrottle = useRef<boolean>(false);

  const throttledCallback = useCallback(
    (...args: T) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );

  return throttledCallback;
};

/**
 * useScrollThrottle - Scroll event throttling
 * 
 * Scroll eventlarını throttle ederek performans optimizasyonu sağlar.
 * Infinite scrolling ve scroll-based animasyonlar için idealdir.
 * 
 * @param callback - Scroll callback
 * @param limit - Throttle limit (ms)
 * @returns Scroll durumu ve cleanup
 */
export const useScrollThrottle = (
  callback: (scrollY: number, scrollDirection: 'up' | 'down') => void,
  limit: number = 100
) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  const throttledCallback = useThrottledCallback((currentScrollY: number) => {
    const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
    setScrollY(currentScrollY);
    setScrollDirection(direction);
    callback(currentScrollY, direction);
    lastScrollY.current = currentScrollY;
  }, limit);

  useEffect(() => {
    const handleScroll = () => {
      throttledCallback(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttledCallback]);

  return { scrollY, scrollDirection };
};

/**
 * useResizeThrottle - Resize event throttling
 * 
 * Window resize eventlarını throttle ederek performans optimizasyonu sağlar.
 * Responsive design ve layout hesaplamaları için kullanışlıdır.
 * 
 * @param callback - Resize callback
 * @param limit - Throttle limit (ms)
 * @returns Window dimensions
 */
export const useResizeThrottle = (
  callback?: (width: number, height: number) => void,
  limit: number = 250
) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const throttledCallback = useThrottledCallback((width: number, height: number) => {
    setDimensions({ width, height });
    callback?.(width, height);
  }, limit);

  useEffect(() => {
    const handleResize = () => {
      throttledCallback(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [throttledCallback]);

  return dimensions;
}; 