import React from "react";
import "../styles/LoadingSpinner.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Finding the best gear for you…" }) => (
  <div className="ax-loading-overlay" role="status" aria-live="polite">
    <div className="ax-spinner" />
    <div className="ax-spinner-text">{text}</div>
  </div>
);

export default LoadingSpinner;
