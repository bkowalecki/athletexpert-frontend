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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface SportCardProps {
  sport: Sport;
  index: number;
  navigate: (path: string) => void;
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ sport, index, navigate }) => (
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
      </div>
    </div>
  )
);

const Community: React.FC = () => {
  const { sports } = useSports(); // ⭐ Use preloaded sports context
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const filteredSports = useMemo(
    () =>
      sports.filter((sport: Sport) =>
        sport.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ),
    [sports, debouncedSearchQuery]
  );

  const handleNavigation = useCallback(
    (sportTitle: string) => {
      navigate(`${sportTitle.toLowerCase()}`);
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
      <div className="sports-masonry">
        {filteredSports.map((sport: Sport, index: number) => (
          <SportCard
            key={sport.title}
            sport={sport}
            index={index}
            navigate={handleNavigation}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Community;
