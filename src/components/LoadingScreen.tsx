import React from "react";
import "../styles/LoadingScreen.css"; // Adjust path if your styles folder is elsewhere

const LoadingScreen: React.FC = () => (
<div className="ax-loading-screen">
  <div className="ax-spinner"></div>
  <p className="ax-loading-text">Loading, please wait...</p>
</div>
);

export default LoadingScreen;
