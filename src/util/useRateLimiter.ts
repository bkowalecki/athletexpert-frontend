import { useRef } from "react";

// max N actions per windowMs
export function useRateLimiter(maxRequests: number, windowMs: number) {
  const requestTimesRef = useRef<number[]>([]);

  const canProceed = () => {
    const now = Date.now();
    requestTimesRef.current = requestTimesRef.current.filter(
      (time) => now - time < windowMs
    );
    return requestTimesRef.current.length < maxRequests;
  };

  const record = () => {
    requestTimesRef.current.push(Date.now());
  };

  return { canProceed, record };
}
