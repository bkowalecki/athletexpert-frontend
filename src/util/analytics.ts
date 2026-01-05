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

export const trackPageView = (path: string, title?: string): void => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
};

const sanitizeOutboundUrl = (rawUrl: string): { domain: string; path: string } | null => {
  try {
    const url = new URL(rawUrl, window.location.origin);
    return { domain: url.origin, path: url.pathname };
  } catch {
    return null;
  }
};

export const trackOutboundClick = (
  url: string,
  context?: AnalyticsParams
): void => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const parsed = sanitizeOutboundUrl(url);
  if (!parsed) return;

  trackEvent("affiliate_click", {
    outbound_domain: parsed.domain,
    outbound_path: parsed.path,
    ...context,
  });
};
