import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: (clientX: number, clientY: number) => void;
  delay?: number;
  moveThreshold?: number;
}

export function useLongPress({ onLongPress, delay = 500, moveThreshold = 10 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };

    timerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress(touch.clientX, touch.clientY);
    }, delay);
  }, [delay, onLongPress]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startPosRef.current && timerRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startPosRef.current.x);
      const deltaY = Math.abs(touch.clientY - startPosRef.current.y);

      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clear();
      }
    }
  }, [moveThreshold, clear]);

  const onTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
