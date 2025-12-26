import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { register } from "./serviceWorkerRegistration";
import { toast } from "react-toastify";
import "./styles/index.css";

const rootEl = document.getElementById("root");

if (!rootEl) {
  // Fail fast with a clear error instead of a cryptic null access.
  throw new Error('Root element "#root" not found.');
}

const root = ReactDOM.createRoot(rootEl as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance
reportWebVitals();

// Register service worker
register({
  onUpdate: (registration) => {
    if (registration?.waiting) {
      toast.info("A new version is available! Click here to update.", {
        position: "bottom-center",
        autoClose: false,
        closeOnClick: true,
        onClick: () => {
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        },
      });
    }
  },
});
