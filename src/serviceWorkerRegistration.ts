// This code is from the official CRA PWA template, enhanced for better readability and debugging.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' || // IPv6 localhost
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/ // IPv4 localhost
  )
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

/**
 * Registers the service worker for production builds.
 * @param config Optional configuration for success and update callbacks.
 */
export function register(config?: Config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    // Ensure the service worker is only registered for the same origin.
    if (publicUrl.origin !== window.location.origin) {
      console.warn('⚠️ Service worker registration skipped: Different origin.');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Running on localhost: Check if a service worker exists.
        console.log('ℹ️ Running on localhost. Checking service worker...');
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '✅ This web app is being served cache-first by a service worker (localhost).'
          );
        });
      } else {
        // Not localhost: Register the service worker.
        console.log('ℹ️ Registering service worker for production...');
        registerValidSW(swUrl, config);
      }
    });
  } else {
    console.warn('⚠️ Service worker registration skipped: Not in production or unsupported.');
  }
}

/**
 * Registers a valid service worker and handles updates.
 * @param swUrl The URL of the service worker script.
 * @param config Optional configuration for success and update callbacks.
 */
function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ Service worker registered successfully.');

      // Handle updates to the service worker.
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available.
              console.log('🔁 New content is available. Please refresh the page.');
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is cached for offline use.
              console.log('✅ Content is cached for offline use.');
              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Error during service worker registration:', error);
    });
}

/**
 * Checks if the service worker is valid and handles updates or unregistration.
 * @param swUrl The URL of the service worker script.
 * @param config Optional configuration for success and update callbacks.
 */
function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker not found or invalid: Unregister it.
        console.warn('⚠️ No valid service worker found. Unregistering...');
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            console.log('ℹ️ Service worker unregistered. Reloading page...');
            window.location.reload();
          });
        });
      } else {
        // Service worker is valid: Register it.
        console.log('ℹ️ Valid service worker found. Registering...');
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('⚠️ No internet connection. App is running in offline mode.');
    });
}

/**
 * Unregisters the service worker.
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister().then(() => {
          console.log('ℹ️ Service worker unregistered successfully.');
        });
      })
      .catch((error) => {
        console.error('❌ Error during service worker unregistration:', error.message);
      });
  }
}