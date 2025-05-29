import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSports } from "../../context/SportsContext"; // ⭐ Import preloaded sports
import "../../styles/Community.css";
import { Helmet } from "react-helmet";

interface Sport {
  title: string;
  backgroundImage: string;
}

export const sportMemberCounts: Record<string, number> = {
  Badminton: 340,
  Baseball: 920,
  Basketball: 1720,
  Boxing: 610,
  Cheerleading: 451,
  Cricket: 1110,
  Cycling: 740,
  "E-Sports": 2052,
  Football: 1980,
  Golf: 493,
  "Ice Hockey": 860,
  "Ice Skating": 380,
  MMA: 1350,
  Pickleball: 781,
  Rugby: 450,
  Running: 1180,
  Skateboarding: 630,
  Skiing: 520,
  Snowboarding: 519,
  Soccer: 2150,
  Surfing: 410,
  Swimming: 975,
  Tennis: 860,
  Volleyball: 833,
  Wrestling: 670,
  Yoga: 1440,
};

interface SportCardProps {
  sport: Sport;
  index: number;
  navigate: (path: string) => void;
  memberCount: number; // ✅ Add this
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ sport, index, navigate, memberCount }) => (
    <div
      className={`sport-card sport-card-${index % 4}`}
      onClick={() => navigate(`${sport.title.toLowerCase()}`)}
    >
      <div className="sport-card-bg">
        <img
          src={sport.backgroundImage}
          alt={`Image of ${sport.title}`} // ⭐ Improved alt text
          className="sport-card-image"
          loading="lazy" // ⭐ Lazy load images for performance
        />
      </div>
      <div className="sport-card-info">
        <h3>{sport.title}</h3>
        <p className="sport-card-members">
          👥 {memberCount.toLocaleString()} members
        </p>
      </div>
    </div>
  )
);

const Community: React.FC = () => {
  const { sports } = useSports(); // ⭐ Use preloaded sports context
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const [triggeredSearch, setTriggeredSearch] = useState("");

  const handleSearch = () => setTriggeredSearch(searchQuery);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const filteredSports = useMemo(
    () =>
      sports.filter((sport) =>
        sport.title.toLowerCase().includes(triggeredSearch.toLowerCase())
      ),
    [sports, triggeredSearch]
  );

  const handleNavigation = useCallback(
    (sportTitle: string) => {
      const slugify = (str: string) =>
        str
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "");

      navigate(slugify(sportTitle));
    },
    [navigate]
  );

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
      {/* (Optional) You could add a search bar here if you want */}
      <div className="community-search-wrapper">
        <form
          className="community-search-bar-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            className="community-search-bar-input"
            placeholder="Search sports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            aria-label="Search sports"
          />
          <button
            type="submit"
            className="community-search-bar-button"
            aria-label="Search"
          />
        </form>
      </div>
      <div className="sports-masonry">
        {filteredSports.map((sport: Sport, index: number) => (
          <SportCard
            key={sport.title}
            sport={sport}
            memberCount={sportMemberCounts[sport.title] || 0}
            index={index}
            navigate={handleNavigation}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Community;
