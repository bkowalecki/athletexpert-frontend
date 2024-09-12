import React, { useEffect, useRef } from 'react';
import '../styles/HeroSection.css';

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure the video is programmatically muted for Safari
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Force mute for Safari autoplay
    }
  }, []);

  return (
    <div className="hero-section">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline // Added for mobile browsers
        className="hero-video"
      >
        <source src="/video/athletexpertheadervideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="hero-content">
        <h1>Gear Tailored to You</h1>
        <p>Don't sweat the search, we've got you covered.</p>
        <div className="cta-buttons">
          <button className="cta-btn">Quiz</button>
          <button className="cta-btn cta-btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
