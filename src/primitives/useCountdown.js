import { useEffect, useRef, useState } from 'react';

// Seconds left while `running`; calls onEnd once when it hits zero.
export function useCountdown(seconds, running, onEnd) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!running) return undefined;
    const startedAt = Date.now() - (seconds - left) * 1000;
    const id = setInterval(() => {
      const next = Math.max(0, seconds - Math.floor((Date.now() - startedAt) / 1000));
      setLeft(next);
      if (next === 0) {
        clearInterval(id);
        endRef.current();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, seconds]);

  return left;
}
