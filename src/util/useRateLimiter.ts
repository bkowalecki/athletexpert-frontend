// src/util/useRateLimiter.ts

import { useCallback, useRef } from "react";

/**
 * Simple in-memory rate limiter hook.
 * Allows up to `maxRequests` within `windowMs`.
 */
export function useRateLimiter(maxRequests: number, windowMs: number) {
  const requestTimesRef = useRef<number[]>([]);

  const canProceed = useCallback((): boolean => {
    const now = Date.now();
    requestTimesRef.current = requestTimesRef.current.filter(
      (time) => now - time < windowMs
    );
    return requestTimesRef.current.length < maxRequests;
  }, [maxRequests, windowMs]);

  const record = useCallback((): void => {
    requestTimesRef.current.push(Date.now());
  }, []);

  const reset = useCallback((): void => {
    requestTimesRef.current = [];
  }, []);

  return { canProceed, record, reset };
}
