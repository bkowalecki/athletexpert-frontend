import React, { useEffect, useRef } from 'react';
import '../styles/HeroSection.css';

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // Set muted programmatically
      videoElement.muted = true;
      videoElement.setAttribute("playsinline", "true");
      
      // Try to play the video programmatically for mobile browsers
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Video playing successfully');
        }).catch((error) => {
          console.error('Autoplay blocked, manual play required:', error);
        });
      }
    }
  }, []);

  return (
    <div className="hero-section">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero-poster.png" // Poster image fallback
        className="hero-video"
      >
        <source src="/video/athletexpertheadervideo.mp4" type="video/mp4" />
        <source src="/video/athletexpertheadervideo.webm" type="video/webm" />
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
