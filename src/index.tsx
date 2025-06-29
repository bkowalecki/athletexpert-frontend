import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register } from './serviceWorkerRegistration';
import { toast } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

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