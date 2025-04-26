import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import sportsDataRaw from "../../data/sports.json";
import "../../styles/Community.css";

interface Sport {
  title: string;
  backgroundImage: string;
}

const sportsData = sportsDataRaw as Sport[];

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

const SportCard: React.FC<SportCardProps> = React.memo(({ sport, index, navigate }) => (
  <div
    className={`sport-card sport-card-${index % 4}`}
    onClick={() => navigate(`${sport.title.toLowerCase()}`)}
  >
    <div className="sport-card-bg">
      <img 
        src={sport.backgroundImage} 
        alt={sport.title} 
        className="sport-card-image"
        // loading="lazy"
      />
    </div>
    <div className="sport-card-info">
      <h3>{sport.title}</h3>
    </div>
  </div>
));


const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const filteredSports = useMemo(
    () =>
      sportsData.filter((sport: Sport) =>
        sport.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ),
    [debouncedSearchQuery]
  );

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
