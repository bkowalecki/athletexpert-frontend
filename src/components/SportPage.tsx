import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import sportsData from "../data/sports.json";
import "../styles/SportPage.css";

interface Sport {
  title: string;
  backgroundImage: string;
  extra_data: {
    category: string;
    type: string;
    popularity: string;
    summary?: string;
  };
}

const SportPage: React.FC = () => {
  const { sport } = useParams<{ sport: string }>();
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);

  useEffect(() => {
    const foundSport = sportsData.find(
      (s) => s.title.toLowerCase() === sport?.toLowerCase()
    );
    setCurrentSport(foundSport || null);
  }, [sport]);

  if (!currentSport) {
    return (
      <div className="community-sport-page">
        <h2 className="community-sport-page-not-found-title">Sport Not Found</h2>
        <p className="community-sport-page-not-found-text">
          We couldn't find information on this sport. Try another!
        </p>
      </div>
    );
  }

  return (
    <div className="community-sport-page">
      {/* Hero Section */}
      <div
        className="community-sport-page-hero"
        style={{ backgroundImage: `url(${currentSport.backgroundImage})` }}
      >
        <div className="community-sport-page-hero-overlay">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="community-sport-page-hero-title"
          >
            {currentSport.title}
          </motion.h1>
          <div className="community-sport-page-hero-ctas">
            <button className="community-sport-page-cta-btn primary">
              Add as Player
            </button>
            <button className="community-sport-page-cta-btn secondary">
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="community-sport-page-about">
        <h2 className="community-sport-page-section-title">About</h2>
        {currentSport.extra_data.summary && (
          <div className="community-sport-page-summary">
            <p className="community-sport-page-summary-text">
              {currentSport.extra_data.summary}
            </p>
          </div>
        )}
      </section>

      {/* Fun Fact Section */}
      <section className="community-sport-page-funfact">
        <motion.div
          className="community-sport-page-funfact-blob-container"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <svg className="community-sport-page-funfact-blob"
            viewBox="0 0 200 150"
            preserveAspectRatio="none">
  <path fill="var(--accent)" d="M56.7,2.4C56.7,7.9,28.3,15.9,-0.1,15.9C-28.5,15.9,-57,7.9,-57,2.4C-57,-3.2,-28.5,-6.4,-0.1,-6.4C28.3,-6.4,56.7,-3.2,56.7,2.4Z" transform="translate(100 100)" />
</svg>
          <svg
            className="community-sport-page-funfact-blob"
            viewBox="0 0 200 150"
            preserveAspectRatio="none"
          >
            <path
              d="M110,30 C140,10, 170,40, 160,70 C150,100, 120,120, 90,110 C60,100, 50,70, 65,50 C80,30, 95,35, 110,30 Z"
              fill="var(--accent)"
            />
            
          </svg>
          <div className="community-sport-page-funfact-inside">
            <p className="community-sport-page-funfact-text">
              Fun Fact: This sport originally had wildly different rules that evolved dramatically over time!
            </p>
          </div>
        </motion.div>
      </section>

      {/* Gear Section */}
      <section className="community-sport-page-gear">
        <h2 className="community-sport-page-section-title">Gear</h2>
        <p className="community-sport-page-section-text">
          Top gear recommendations for this sport will appear here.
        </p>
      </section>

      {/* Blog Section */}
      <section className="community-sport-page-blogs">
        <h2 className="community-sport-page-section-title">Blog</h2>
        <p className="community-sport-page-section-text">
          Discover articles, tips, and guides for {currentSport.title}.
        </p>
      </section>
    </div>
  );
};

export default SportPage;
