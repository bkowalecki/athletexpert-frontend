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
        <h2>Sport Not Found</h2>
        <p>We couldn't find information on this sport. Try another!</p>
      </div>
    );
  }

  return (
    <div className="sport-page">
      {/* 🎥 Hero Section */}
      <div
        className="sport-hero"
        style={{ backgroundImage: `url(${currentSport.backgroundImage})` }}
      >
        <div className="sport-hero-overlay">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {currentSport.title}
          </motion.h1>
        </div>
      </div>

      {/* 📖 About the Sport */}
      <section className="sport-about">
        <h2>About</h2>
        <p>
          {currentSport.title} is a {currentSport.extra_data.category.toLowerCase()} that is played {currentSport.extra_data.type.toLowerCase()}.
          It has gained {currentSport.extra_data.popularity.toLowerCase()} popularity worldwide.
        </p>
      </section>

      {/* 🏆 Leaderboard (Placeholder) */}
      {/* <section className="sport-leaderboard">
        <h2>🏆 Leaderboard (Coming Soon)</h2>
        <p>Track the top athletes and stats for {currentSport.title}.</p>
      </section> */}

      {/* 🏋️ Recommended Gear */}
      <section className="sport-gear">
        <h2>Gear</h2>
        <p>Top gear recommendations for this sport will appear here.</p>
      </section>

      {/* 📝 Related Blog Posts */}
      <section className="sport-blogs">
        <h2>Blog</h2>
        <p>Discover articles, tips, and guides for {currentSport.title}.</p>
      </section>
    </div>
  );
};

export default SportPage;
