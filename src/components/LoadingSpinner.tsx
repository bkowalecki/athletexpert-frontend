// LoadingSpinner.tsx
import React from "react";
import "../styles/LoadingSpinner.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Loading..." }) => (
  <div className="loading-spinner-overlay" role="status" aria-live="polite">
    <div className="new-spinner" />
    <p style={{ margin: 0 }}>{text}</p>
  </div>
);

export default LoadingSpinner;
