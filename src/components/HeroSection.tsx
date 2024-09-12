import React from 'react';
import '../styles/HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <video autoPlay loop muted className="hero-video">
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