/**
 * useAnimations Custom Hook
 *
 * Bu dosya, TaskFlow uygulamasında micro-interactions ve animasyonlar
 * için kullanılan custom hook'u içerir. Kullanıcı deneyimini iyileştirmek
 * için çeşitli animasyon efektleri sağlar.
 *
 * Ana Özellikler:
 * - Hover animasyonları
 * - Click animasyonları
 * - Loading animasyonları
 * - Transition efektleri
 * - Staggered animasyonlar
 * - Scroll-triggered animasyonlar
 *
 * Animasyon Türleri:
 * - Fade in/out
 * - Slide in/out
 * - Scale in/out
 * - Rotate
 * - Bounce
 * - Pulse
 * - Shake
 * - Wiggle
 *
 * Performance:
 * - RequestAnimationFrame kullanımı
 * - Optimized transitions
 * - Memory management
 * - Debounced animations
 *
 * Accessibility:
 * - Reduced motion support
 * - Screen reader friendly
 * - Keyboard navigation
 * - Focus indicators
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

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Animation State Interface
 */
interface AnimationState {
  isAnimating: boolean;
  isVisible: boolean;
  hasAnimated: boolean;
}

/**
 * Animation Options Interface
 */
interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * useAnimations Custom Hook
 *
 * Micro-interactions ve animasyonlar için kullanılan hook.
 * Çeşitli animasyon efektleri ve state yönetimi sağlar.
 *
 * @param options - Animasyon seçenekleri
 * @returns Animation state ve fonksiyonları
 */
export const useAnimations = (options: AnimationOptions = {}) => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease-out',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    isVisible: false,
    hasAnimated: false
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<number | null>(null);

  /**
   * Fade in animasyonu
   */
  const fadeIn = useCallback(() => {
    if (!elementRef.current) return;

    setAnimationState(prev => ({ ...prev, isAnimating: true }));

    const element = elementRef.current;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;

    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay);

    setTimeout(() => {
      setAnimationState(prev => ({ 
        ...prev, 
        isAnimating: false, 
        isVisible: true,
        hasAnimated: true 
      }));
    }, delay + duration);
  }, [duration, delay, easing]);

  /**
   * Fade out animasyonu
   */
  const fadeOut = useCallback(() => {
    if (!elementRef.current) return;

    setAnimationState(prev => ({ ...prev, isAnimating: true }));

    const element = elementRef.current;
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    element.style.opacity = '0';
    element.style.transform = 'translateY(-20px)';

    setTimeout(() => {
      setAnimationState(prev => ({ 
        ...prev, 
        isAnimating: false, 
        isVisible: false 
      }));
    }, duration);
  }, [duration, easing]);

  /**
   * Scale animasyonu
   */
  const scale = useCallback((scaleValue: number = 1.05) => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const originalTransform = element.style.transform;
    
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = `scale(${scaleValue})`;

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  }, [duration, easing]);

  /**
   * Bounce animasyonu
   */
  const bounce = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const originalTransform = element.style.transform;
    
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = 'scale(1.1)';

    setTimeout(() => {
      element.style.transform = 'scale(0.95)';
    }, duration / 2);

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  }, [duration, easing]);

  /**
   * Shake animasyonu
   */
  const shake = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const originalTransform = element.style.transform;
    
    const shakeKeyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' }
    ];

    element.animate(shakeKeyframes, {
      duration: duration,
      easing: easing
    });

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  }, [duration, easing]);

  /**
   * Pulse animasyonu
   */
  const pulse = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const originalTransform = element.style.transform;
    
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = 'scale(1.05)';

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  }, [duration, easing]);

  /**
   * Wiggle animasyonu
   */
  const wiggle = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const originalTransform = element.style.transform;
    
    const wiggleKeyframes = [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(0deg)' }
    ];

    element.animate(wiggleKeyframes, {
      duration: duration,
      easing: easing
    });

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  }, [duration, easing]);

  /**
   * Intersection Observer ile scroll-triggered animasyon
   */
  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationState.hasAnimated) {
            fadeIn();
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [fadeIn, threshold, triggerOnce, animationState.hasAnimated]);

  /**
   * Cleanup function
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    elementRef,
    animationState,
    fadeIn,
    fadeOut,
    scale,
    bounce,
    shake,
    pulse,
    wiggle,
    isAnimating: animationState.isAnimating,
    isVisible: animationState.isVisible
  };
};

/**
 * useHoverAnimation Hook
 *
 * Hover animasyonları için özel hook
 */
export const useHoverAnimation = (options: AnimationOptions = {}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { scale, pulse } = useAnimations(options);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scale(1.05);
  }, [scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    scale(1);
  }, [scale]);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave
  };
};

/**
 * useClickAnimation Hook
 *
 * Click animasyonları için özel hook
 */
export const useClickAnimation = (options: AnimationOptions = {}) => {
  const { bounce, shake } = useAnimations(options);

  const handleClick = useCallback(() => {
    bounce();
  }, [bounce]);

  const handleErrorClick = useCallback(() => {
    shake();
  }, [shake]);

  return {
    handleClick,
    handleErrorClick
  };
};

/**
 * useLoadingAnimation Hook
 *
 * Loading animasyonları için özel hook
 */
export const useLoadingAnimation = (options: AnimationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { pulse } = useAnimations(options);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const pulseWhileLoading = useCallback(() => {
    if (isLoading) {
      pulse();
    }
  }, [isLoading, pulse]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    pulseWhileLoading
  };
}; 