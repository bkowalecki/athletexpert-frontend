import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSports } from "../../context/SportsContext";
import "../../styles/Community.css";
import { Helmet } from "react-helmet";

interface Sport {
  title: string;
  backgroundImage: string;
}

export const sportMemberCounts: Record<string, number> = {
  Badminton: 141,
  Baseball: 820,
  Basketball: 1720,
  Boxing: 610,
  Cheerleading: 521,
  Cricket: 810,
  Cycling: 740,
  "E-Sports": 0,
  Football: 1980,
  Golf: 993,
  "Ice Hockey": 668,
  "Ice Skating": 380,
  MMA: 1350,
  Pickleball: 2081,
  Rugby: 450,
  Running: 3188,
  Skateboarding: 630,
  Skiing: 520,
  Snowboarding: 519,
  Soccer: 2150,
  Surfing: 410,
  Swimming: 975,
  Tennis: 860,
  Volleyball: 333,
  "Weight Training": 1450,
  Wrestling: 670,
  Yoga: 1440,
};

interface SportCardProps {
  sport: Sport;
  index: number;
  navigate: (path: string) => void;
  memberCount: number;
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ sport, index, navigate, memberCount }) => {
    const isEsports = sport.title.toLowerCase() === "e-sports";
    return (
      <div
        className={`sport-card sport-card-${index % 4} ${isEsports ? "esport-preview-card esport-card-disabled" : ""}`}
        onClick={isEsports ? undefined : () => navigate(sport.title.toLowerCase())}
        tabIndex={isEsports ? -1 : 0}
        aria-disabled={isEsports ? "true" : "false"}
      >
        <div className="sport-card-bg">
          <img
            src={sport.backgroundImage}
            alt={`Image of ${sport.title}`}
            className="sport-card-image"
            loading="lazy"
          />
          {isEsports && (
            <div className="esport-coming-soon-overlay">
              <span>Coming soon</span>
            </div>
          )}
        </div>
        <div className="sport-card-info">
          <h3>{sport.title}</h3>
          <p className="sport-card-members">👥 {memberCount.toLocaleString()} members</p>
        </div>
      </div>
    );
  }
);

const Community: React.FC = () => {
  const { sports } = useSports();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredSports = useMemo(
    () =>
      sports.filter((sport) =>
        sport.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sports, searchQuery]
  );

  const handleNavigation = useCallback(
    (sportTitle: string) => {
      const slugify = (str: string) =>
        str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
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
      <h1 className="community-page-title">Community</h1>
      <div className="sports-masonry">
        {filteredSports.map((sport, index) => (
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