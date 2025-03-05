import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import sportsDataRaw from "../../data/sports.json";
import "../../styles/Community.css";

// Define the type for each sport.
interface Sport {
  title: string;
  backgroundImage: string;
}

// Cast the imported JSON to an array of Sport objects.
const sportsData = sportsDataRaw as Sport[];

// Custom hook for debouncing a value (e.g., search input)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Props for the FeaturedSportCard component
interface FeaturedSportCardProps {
  sport: Sport;
  navigate: (path: string) => void;
}

const FeaturedSportCard: React.FC<FeaturedSportCardProps> = React.memo(
  ({ sport, navigate }) => (
    <motion.div
      className="featured-sport-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      onClick={() => navigate(`${sport.title.toLowerCase()}`)}
    >
      <div
        className="featured-sport-bg"
        style={{ backgroundImage: `url(${sport.backgroundImage})` }}
      />
      <div className="featured-sport-info">
        <h2>{sport.title}</h2>
      </div>
    </motion.div>
  )
);

// Props for the SportCard component
interface SportCardProps {
  sport: Sport;
  index: number;
  navigate: (path: string) => void;
}

const SportCard: React.FC<SportCardProps> = React.memo(({ sport, index, navigate }) => (
  <motion.div
    className={`sport-card sport-card-${index % 4}`}
    onClick={() => navigate(`${sport.title.toLowerCase()}`)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="sport-card-bg">
      <img 
        src={sport.backgroundImage} 
        alt={sport.title} 
        className="sport-card-image"
        loading="lazy"  // ✅ Lazy load for performance
        width="300" 
        height="200"
      />
    </div>
    <div className="sport-card-info">
      <h3>{sport.title}</h3>
    </div>
  </motion.div>
));


const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [featuredSport, setFeaturedSport] = useState<Sport>(sportsData[0]);
  const navigate = useNavigate();

  // Debounce search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  // Memoize filtered sports list for performance
  const filteredSports = useMemo(
    () =>
      sportsData.filter((sport: Sport) =>
        sport.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ),
    [debouncedSearchQuery]
  );

  // Ensure the featured sport stays constant across sessions using localStorage
  useEffect(() => {
    const storedSport = localStorage.getItem("featuredSport");
    if (storedSport) {
      try {
        setFeaturedSport(JSON.parse(storedSport));
      } catch (error) {
        console.error("Error parsing stored featured sport:", error);
      }
    } else {
      const randomSport = sportsData[Math.floor(Math.random() * sportsData.length)];
      setFeaturedSport(randomSport);
      localStorage.setItem("featuredSport", JSON.stringify(randomSport));
    }
  }, []);

  // Memoize navigation handler
  const handleNavigation = useCallback(
    (sportTitle: string) => {
      navigate(`${sportTitle.toLowerCase()}`);
    },
    [navigate]
  );

  return (
    <div className="community-page">
     
      <div className="sports-masonry">
        {filteredSports.map((sport: Sport, index: number) => (
          <SportCard key={sport.title} sport={sport} index={index} navigate={handleNavigation} />
        ))}
      </div>
    </div>
  );
};

export default Community;
