/* eslint-disable no-console */

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(
      window.location.hostname
    )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
    return;
  }

  const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

  window.addEventListener("load", () => {
    if (isLocalhost) {
      // On localhost, check if a valid service worker exists
      checkValidServiceWorker(swUrl, config);
      navigator.serviceWorker.ready.then(() => {
        console.log("Service worker ready (localhost).");
      });
    } else {
      // In production, register directly
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              config?.onUpdate?.(registration);
            } else {
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType && !contentType.includes("javascript"))
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log("Offline mode enabled.");
    });
}

export function unregister(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch(() => {});
  }
}
