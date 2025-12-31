import React from "react";
import ReactDOM from "react-dom/client";
import { toast } from "react-toastify";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { register } from "./serviceWorkerRegistration";
import "./styles/index.css";

const rootEl = document.getElementById("root");

if (!rootEl) {
  // Fail fast with a clear error instead of a cryptic null access.
  throw new Error('Root element "#root" not found.');
}

const root = ReactDOM.createRoot(rootEl);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance (pass a callback to log/send metrics if desired)
// e.g. reportWebVitals(console.log);
reportWebVitals();

// Register service worker
register({
  onUpdate: (registration) => {
    const waitingSW = registration?.waiting;
    if (!waitingSW) return;

    // Prevent duplicate "update available" toasts if onUpdate fires multiple times
    const TOAST_ID = "sw-update-available";

    toast.info("A new version is available! Click here to update.", {
      toastId: TOAST_ID,
      position: "bottom-center",
      autoClose: false,
      closeOnClick: true,
      onClick: () => {
        // Ask the waiting SW to activate immediately
        waitingSW.postMessage({ type: "SKIP_WAITING" });

        // Reload shortly after; avoids edge cases where reload happens before control swaps
        setTimeout(() => {
          window.location.reload();
        }, 150);
      },
    });
  },
});
