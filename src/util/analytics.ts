// src/util/analytics.ts

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<string, unknown>;

export const trackEvent = (eventName: string, params?: AnalyticsParams): void => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params ?? {});
};
