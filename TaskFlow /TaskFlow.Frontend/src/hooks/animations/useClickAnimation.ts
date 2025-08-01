/**
 * useClickAnimation Hook
 * 
 * Click animasyonları için specialized hook.
 */

import { useState, useCallback, useRef } from 'react';

interface ClickAnimationOptions {
  duration?: number;
  scale?: number;
  ripple?: boolean;
}

interface ClickAnimationReturn {
  isClicked: boolean;
  clickRef: React.RefObject<HTMLElement>;
  clickProps: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    style: React.CSSProperties;
  };
}

/**
 * useClickAnimation Hook
 */
export const useClickAnimation = (options: ClickAnimationOptions = {}): ClickAnimationReturn => {
  const {
    duration = 150,
    scale = 0.95,
    ripple = false,
  } = options;

  const [isClicked, setIsClicked] = useState(false);
  const clickRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsClicked(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsClicked(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsClicked(false);
  }, []);

  const clickProps = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    style: {
      transform: isClicked ? `scale(${scale})` : 'scale(1)',
      transition: `transform ${duration}ms ease-in-out`,
      position: ripple ? 'relative' : 'static',
      overflow: ripple ? 'hidden' : 'visible',
    } as React.CSSProperties,
  };

  return {
    isClicked,
    clickRef,
    clickProps,
  };
};

export default useClickAnimation; 