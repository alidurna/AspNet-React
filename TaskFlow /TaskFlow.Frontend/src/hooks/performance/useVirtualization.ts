/**
 * Virtualization Hooks
 * 
 * Virtual scrolling ve lazy loading ile performans optimizasyonu sağlayan hooks.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * Virtual Scroll Item Interface
 */
interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

/**
 * Virtual Scroll Options
 */
interface VirtualScrollOptions {
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  scrollingDelay?: number;
  getScrollElement?: () => Element | null;
}

/**
 * useVirtualScroll - Virtual scrolling hook
 * 
 * Büyük listeler için virtual scrolling implementasyonu.
 * Sadece görünen elemanları render ederek performans optimizasyonu sağlar.
 * 
 * @param itemCount - Toplam item sayısı
 * @param options - Virtual scroll seçenekleri
 * @returns Virtual scroll durumu ve fonksiyonları
 */
export const useVirtualScroll = (
  itemCount: number,
  options: VirtualScrollOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollingDelay = 150,
    getScrollElement,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();

  // Item height calculator
  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: number[] = [0];
    
    for (let i = 1; i <= itemCount; i++) {
      positions[i] = positions[i - 1] + getItemHeight(i - 1);
    }
    
    return positions;
  }, [itemCount, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const totalHeight = itemPositions[itemCount] || 0;
    
    if (totalHeight === 0) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = itemCount - 1;

    // Find start index
    for (let i = 0; i < itemCount; i++) {
      if (itemPositions[i + 1] > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = start; i < itemCount; i++) {
      if (itemPositions[i] >= scrollTop + containerHeight) {
        end = Math.min(itemCount - 1, i + overscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemCount, itemPositions, overscan]);

  // Calculate virtual items
  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        start: itemPositions[i],
        end: itemPositions[i + 1] || itemPositions[i] + getItemHeight(i),
        size: getItemHeight(i),
      });
    }
    
    return items;
  }, [visibleRange, itemPositions, getItemHeight]);

  // Total height
  const totalHeight = itemPositions[itemCount] || 0;

  // Scroll handler
  const handleScroll = useCallback((event: Event) => {
    const element = event.target as Element;
    setScrollTop(element.scrollTop);
    
    setIsScrolling(true);
    
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
    
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);
  }, [scrollingDelay]);

  // Setup scroll listener
  useEffect(() => {
    const element = getScrollElement?.() || window;
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, [handleScroll, getScrollElement]);

  // Scroll to index
  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      const element = getScrollElement?.() || window;
      const itemStart = itemPositions[index];
      
      let scrollTo = itemStart;
      
      if (align === 'center') {
        scrollTo = itemStart - containerHeight / 2 + getItemHeight(index) / 2;
      } else if (align === 'end') {
        scrollTo = itemStart - containerHeight + getItemHeight(index);
      }
      
      if ('scrollTo' in element) {
        element.scrollTo({ top: scrollTo, behavior: 'smooth' });
      } else {
        (element as Window).scrollTo({ top: scrollTo, behavior: 'smooth' });
      }
    },
    [itemPositions, containerHeight, getItemHeight, getScrollElement]
  );

  return {
    virtualItems,
    totalHeight,
    scrollTop,
    isScrolling,
    scrollToIndex,
    visibleRange,
  };
};

/**
 * useIntersectionObserver - Intersection Observer hook
 * 
 * Element görünürlük durumunu izleyerek lazy loading sağlar.
 * Image lazy loading ve infinite scrolling için kullanışlıdır.
 * 
 * @param options - Intersection Observer seçenekleri
 * @returns Observer ref ve entry durumu
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  const setRef = useCallback((element: Element | null) => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    
    elementRef.current = element;
    
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  return {
    ref: setRef,
    entry,
    isIntersecting,
  };
};

/**
 * useInfiniteScroll - Infinite scrolling hook
 * 
 * Sonsuz scroll implementasyonu sağlar.
 * Sayfalama ve lazy loading ile birlikte kullanılır.
 * 
 * @param hasNextPage - Daha fazla sayfa var mı?
 * @param fetchNextPage - Sonraki sayfayı yükle
 * @param options - Infinite scroll seçenekleri
 * @returns Loading durumu ve trigger ref
 */
export const useInfiniteScroll = (
  hasNextPage: boolean,
  fetchNextPage: () => Promise<void>,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
  } = options;

  const [isFetching, setIsFetching] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && enabled && !isFetching) {
      setIsFetching(true);
      
      fetchNextPage()
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [isIntersecting, hasNextPage, enabled, isFetching, fetchNextPage]);

  return {
    ref,
    isFetching,
  };
}; 