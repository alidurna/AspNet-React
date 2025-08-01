/**
 * useHoverAnimation Hook
 * 
 * Hover animasyonları için specialized hook.
 */

import { useState, useCallback, useRef } from 'react';

interface HoverAnimationOptions {
  duration?: number;
  scale?: number;
  translateY?: number;
  opacity?: number;
}

interface HoverAnimationReturn {
  isHovered: boolean;
  hoverRef: React.RefObject<HTMLElement>;
  hoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    style: React.CSSProperties;
  };
}

/**
 * useHoverAnimation Hook
 */
export const useHoverAnimation = (options: HoverAnimationOptions = {}): HoverAnimationReturn => {
  const {
    duration = 200,
    scale = 1.05,
    translateY = -2,
    opacity = 1,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const hoverRef = useRef<HTMLElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const hoverProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    style: {
      transform: isHovered 
        ? `scale(${scale}) translateY(${translateY}px)` 
        : 'scale(1) translateY(0px)',
      opacity: isHovered ? opacity : 1,
      transition: `all ${duration}ms ease-in-out`,
    } as React.CSSProperties,
  };

  return {
    isHovered,
    hoverRef,
    hoverProps,
  };
};

export default useHoverAnimation; 