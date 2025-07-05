import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSports } from "../../context/SportsContext";
import "../../styles/Community.css";
import { Helmet } from "react-helmet";

// ===================== Types & Data =====================
interface Sport {
  title: string;
  backgroundImage: string;
}

const sportMemberCounts: Record<string, number> = {
  Badminton: 141, Baseball: 820, Basketball: 1720, Boxing: 610, Cheerleading: 521,
  Cricket: 810, Cycling: 740, "E-Sports": 0, Football: 1980, Golf: 993, "Ice Hockey": 668,
  "Ice Skating": 380, MMA: 1350, Pickleball: 2081, Rugby: 450, Running: 3188,
  Skateboarding: 630, Skiing: 520, Snowboarding: 519, Soccer: 2150, Surfing: 410,
  Swimming: 975, Tennis: 860, Volleyball: 333, "Weight Training": 1450,
  Wrestling: 670, Yoga: 1440,
};

// Helper to slugify sport title for URL
const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

// ===================== Sport Card =====================
interface SportCardProps {
  sport: Sport;
  memberCount: number;
  className: string;
  onNavigate: (slug: string) => void;
  isDisabled: boolean;
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ sport, memberCount, className, onNavigate, isDisabled }) => {
    // Keyboard accessibility
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
        onNavigate(slugify(sport.title));
      }
    };

    return (
      <div
        className={className}
        onClick={!isDisabled ? () => onNavigate(slugify(sport.title)) : undefined}
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        onKeyDown={handleKeyDown}
        role="button"
        aria-label={`Go to ${sport.title} community page`}
        title={isDisabled ? "Coming soon!" : `Go to ${sport.title} community`}
      >
        <div className="sport-card-bg">
          <img
            src={sport.backgroundImage}
            alt={`Background for ${sport.title}`}
            className="sport-card-image"
            loading="lazy"
          />
          {isDisabled && (
            <div className="esport-coming-soon-overlay" title="Coming soon!">
              <span>Coming soon</span>
            </div>
          )}
        </div>
        <div className="sport-card-info">
          <h3>{sport.title}</h3>
          <p className="sport-card-members">
            👥 {memberCount.toLocaleString()} members
          </p>
        </div>
      </div>
    );
  }
);

// ===================== Community Page =====================
const Community: React.FC = () => {
  const { sports } = useSports();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filtering sports based on search query
  const filteredSports = useMemo(() => {
    if (!searchQuery.trim()) return sports;
    const q = searchQuery.toLowerCase();
    return sports.filter((sport) => sport.title.toLowerCase().includes(q));
  }, [sports, searchQuery]);

  // Memoized navigation callback
  const handleNavigation = useCallback(
    (slug: string) => {
      navigate(`/community/${slug}`);
    },
    [navigate]
  );

  // Helper for alternating card classes (for grid background color variety)
  const getCardClass = (sport: Sport, idx: number) => {
    const base = "sport-card sport-card-" + (idx % 4);
    const isEsports = sport.title.toLowerCase() === "e-sports";
    return `${base} ${isEsports ? "esport-preview-card esport-card-disabled" : ""}`;
  };

  return (
    <motion.div
      className="community-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>AthleteXpert | Community</title>
        <meta
          name="description"
          content="Join your sports community on AthleteXpert and connect with other athletes."
        />
      </Helmet>

      <h1 className="community-page-title">Community</h1>

      {/* Uncomment if/when you want a search bar for sports */}
      {/* <div className="community-search-wrapper">
        <form
          className="community-search-bar-form"
          onSubmit={e => e.preventDefault()}
        >
          <input
            className="community-search-bar-input"
            type="text"
            placeholder="Search sports…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search sports"
          />
          <button className="community-search-bar-button" type="submit">
            <span role="img" aria-label="Search">🔍</span>
          </button>
        </form>
      </div> */}

      <div className="sports-masonry">
        {filteredSports.map((sport, index) => (
          <SportCard
            key={sport.title}
            sport={sport}
            memberCount={sportMemberCounts[sport.title] || 0}
            className={getCardClass(sport, index)}
            onNavigate={handleNavigation}
            isDisabled={sport.title.toLowerCase() === "e-sports"}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Community;
