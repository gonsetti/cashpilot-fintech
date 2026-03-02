import { useState, useEffect, useRef, useCallback } from "react";

export function useCountUp(target: number, suffix = "", isFloat = false, duration = 1000) {
  const [value, setValue] = useState("0" + suffix);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue((isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString()) + suffix);
        clearInterval(interval);
      } else {
        setValue((isFloat ? start.toFixed(1) : Math.floor(start).toLocaleString()) + suffix);
      }
    }, 16);
  }, [target, suffix, isFloat]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, value };
}
