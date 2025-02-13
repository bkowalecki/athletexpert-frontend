import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import sportsData from "../data/sports.json";
import "../styles/Community.css";

const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSports, setFilteredSports] = useState(sportsData);
  const [featuredSport, setFeaturedSport] = useState(sportsData[0]);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredSports(
      sportsData.filter((sport) =>
        sport.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // Randomly select a featured sport on first load
  useEffect(() => {
    const randomSport =
      sportsData[Math.floor(Math.random() * sportsData.length)];
    setFeaturedSport(randomSport);
  }, []);

  return (
    <div className="community-page">
      {/* 🌟 Hero Section */}
      <div className="community-hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/community-hero-poster.png"
          className="community-hero-video"
        >
          <source src="/video/athletexpertheadervideo.mp4" type="video/mp4" />
          <source src="/video/athletexpertheadervideo.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        <div className="community-hero-content">
          <h1>Find Your Sport. Join the Community.</h1>
          <div className="community-search-bar">
            <input
              type="text"
              placeholder="Search for a sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 🌟 Featured Sport Section */}
      <div className="featured-sport">
        <h2>Featured Sport</h2>
        <motion.div
          className="featured-sport-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          onClick={() => navigate(`/community/${featuredSport.title.toLowerCase()}`)}
        >
          <div
            className="featured-sport-bg"
            style={{ backgroundImage: `url(${featuredSport.backgroundImage})` }}
          />
          <div className="featured-sport-info">
            <h2>{featuredSport.title}</h2>
          
          </div>
        </motion.div>
      </div>

      {/* 🌟 Masonry Sports Grid */}
      <div className="sports-masonry">
        {filteredSports.map((sport, index) => (
          <motion.div
            key={sport.title}
            className={`sport-card sport-card-${index % 4}`}
            onClick={() => navigate(`/community/${sport.title.toLowerCase()}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="sport-card-bg"
              style={{ backgroundImage: `url(${sport.backgroundImage})` }}
            />
            <div className="sport-card-info">
              <h3>{sport.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Community;
