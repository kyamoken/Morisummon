import { useState, useEffect, useCallback } from 'react';

type UseTimeoutReturn = {
  isActive: boolean;
  start: () => void;
  stop: () => void;
};

function useTimeout(callback: () => void, delay: number | null): UseTimeoutReturn {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    const timeout = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(timeout);
  }, [callback, delay, isActive]);

  const start = useCallback(() => setIsActive(true), []);
  const stop = useCallback(() => setIsActive(false), []);

  return {
    isActive,
    start,
    stop,
  };
}

export default useTimeout;
