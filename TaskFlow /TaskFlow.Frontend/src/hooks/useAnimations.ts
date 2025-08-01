/**
 * useAnimations Custom Hook - Refactored
 *
 * Modüler animasyon hook'larını orchestrate eden ana hook.
 * Micro-interactions ve animasyonlar için unified interface sağlar.
 *
 * @version 2.0.0 - Modular
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Sub-hooks
import { useHoverAnimation } from './animations/useHoverAnimation';
import { useClickAnimation } from './animations/useClickAnimation';

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
 * Fade Animation Hook
 */
export const useFadeAnimation = (options: AnimationOptions = {}) => {
  const { duration = 300, delay = 0 } = options;
  const [isVisible, setIsVisible] = useState(false);

  const fadeIn = useCallback(() => {
    setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const fadeOut = useCallback(() => {
    setIsVisible(false);
  }, []);

  const fadeProps = {
    style: {
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${duration}ms ease-in-out`,
    },
  };

  return { isVisible, fadeIn, fadeOut, fadeProps };
};

/**
 * Slide Animation Hook
 */
export const useSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const [isVisible, setIsVisible] = useState(false);

  const getTransform = (visible: boolean) => {
    if (visible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'up': return 'translate(0, 20px)';
      case 'down': return 'translate(0, -20px)';
      case 'left': return 'translate(20px, 0)';
      case 'right': return 'translate(-20px, 0)';
      default: return 'translate(0, 20px)';
    }
  };

  const slideProps = {
    style: {
      transform: getTransform(isVisible),
      opacity: isVisible ? 1 : 0,
      transition: 'all 300ms ease-in-out',
    },
  };

  return { isVisible, setIsVisible, slideProps };
};

/**
 * Scale Animation Hook
 */
export const useScaleAnimation = (options: { scale?: number; duration?: number } = {}) => {
  const { scale = 1.1, duration = 200 } = options;
  const [isScaled, setIsScaled] = useState(false);

  const scaleProps = {
    style: {
      transform: isScaled ? `scale(${scale})` : 'scale(1)',
      transition: `transform ${duration}ms ease-in-out`,
    },
  };

  return { isScaled, setIsScaled, scaleProps };
};

/**
 * Pulse Animation Hook
 */
export const usePulseAnimation = (duration: number = 1000) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!isPulsing) return;

    const interval = setInterval(() => {
      // Pulse effect handled by CSS animation
    }, duration);

    return () => clearInterval(interval);
  }, [isPulsing, duration]);

  const pulseProps = {
    style: {
      animation: isPulsing ? `pulse ${duration}ms infinite` : 'none',
    },
  };

  return { isPulsing, setIsPulsing, pulseProps };
};

/**
 * Scroll Animation Hook
 */
export const useScrollAnimation = (options: AnimationOptions = {}) => {
  const { threshold = 0.1, triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
          setIsVisible(true);
          setHasAnimated(true);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, hasAnimated]);

  return { ref, isVisible, hasAnimated };
};

/**
 * Main useAnimations Hook - Orchestrator
 */
export const useAnimations = (options: AnimationOptions = {}) => {
  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    isVisible: false,
    hasAnimated: false,
  });

  // Sub-hooks
  const hoverAnimation = useHoverAnimation();
  const clickAnimation = useClickAnimation();
  const fadeAnimation = useFadeAnimation(options);
  const slideAnimation = useSlideAnimation();
  const scaleAnimation = useScaleAnimation();
  const pulseAnimation = usePulseAnimation();
  const scrollAnimation = useScrollAnimation(options);

  const startAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: true }));
  }, []);

  const stopAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const resetAnimation = useCallback(() => {
    setState({
      isAnimating: false,
      isVisible: false,
      hasAnimated: false,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Controls
    startAnimation,
    stopAnimation,
    resetAnimation,
    
    // Sub-animations
    hover: hoverAnimation,
    click: clickAnimation,
    fade: fadeAnimation,
    slide: slideAnimation,
    scale: scaleAnimation,
    pulse: pulseAnimation,
    scroll: scrollAnimation,
  };
};

// Re-export sub-hooks
export { useHoverAnimation } from './animations/useHoverAnimation';
export { useClickAnimation } from './animations/useClickAnimation';

export default useAnimations; 