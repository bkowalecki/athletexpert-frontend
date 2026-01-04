import React from "react";
import "../styles/LoadingScreen.css";

const LoadingScreen: React.FC = () => (
  <div
    className="ax-loading-overlay"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="ax-loading-content">
      {/* Screen-reader friendly text */}
      <span className="sr-only">Loading, please wait...</span>

      {/* Visual spinner (hidden from screen readers) */}
      <div className="ax-spinner" aria-hidden="true"></div>

      {/* Optional logo if you ever want it back */}
      {/*
      <img
        src="/favicon.png"
        alt=""
        aria-hidden="true"
        className="ax-loading-logo"
      />
      */}
    </div>
  </div>
);

export default LoadingScreen;
