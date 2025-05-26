declare global {
    interface Window {
      gtag?: (...args: any[]) => void;
    }
  }

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  };