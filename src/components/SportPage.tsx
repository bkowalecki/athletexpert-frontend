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
      <div className="sport-page">
        <h2 className="sport-page-not-found">Sport Not Found</h2>
        <p className="sport-page-not-found-text">
          We couldn't find information on this sport. Try another!
        </p>
      </div>
    );
  }

  return (
    <div className="sport-page">
      {/* Hero Section */}
      <div
        className="sport-page-hero"
        style={{ backgroundImage: `url(${currentSport.backgroundImage})` }}
      >
        <div className="sport-page-hero-overlay">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="sport-page-title"
          >
            {currentSport.title}
          </motion.h1>
          <div className="sport-page-buttons">
            <button className="sport-page-btn primary">Add as Player</button>
            <button className="sport-page-btn secondary">Follow</button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">About {currentSport.title}</h2>
        {currentSport.extra_data.summary && (
          <p className="sport-page-text">{currentSport.extra_data.summary}</p>
        )}
      </section>

      {/* Fun Fact Section */}
      <section className="sport-page-section sport-page-funfact">
        <h2 className="sport-page-section-title">Fun Fact</h2>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sport-page-funfact-box"
        >
          <p className="sport-page-funfact-text">
            This sport originally had wildly different rules that evolved over time!
          </p>
        </motion.div>
      </section>

      {/* Gear Section */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Recommended Gear</h2>
        <p className="sport-page-text">
          Top gear recommendations for this sport will appear here.
        </p>
      </section>

      {/* Blog Section */}
      <section className="sport-page-section">
        <h2 className="sport-page-section-title">Explore More</h2>
        <p className="sport-page-text">
          Discover articles, tips, and guides for {currentSport.title}.
        </p>
      </section>
    </div>
  );
};

export default SportPage;
