import React from "react";
import "../styles/LoadingScreen.css";

const LoadingScreen: React.FC = () => (
  <div className="ax-loading-overlay">
    <div className="ax-loading-content">
      <div className="ax-spinner"></div>
      {/* <img
        src="/favicon.png"
        alt="AthleteXpert logo"
        className="ax-loading-logo"
      /> */}
    </div>
  </div>
);

export default LoadingScreen;