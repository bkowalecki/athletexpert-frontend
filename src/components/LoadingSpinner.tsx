import React from "react";
import "../styles/LoadingSpinner.css";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="spinner"></div>
      <p>Loading your recommendations...</p>
    </div>
  );
};

export default LoadingSpinner;
