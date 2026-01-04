import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSports } from "../../context/SportsContext";
import "../../styles/Community.css";
import { Helmet } from "react-helmet";
import { trackEvent } from "../../util/analytics";
import { slugifySportName } from "../../util/slug";

/**
 * NOTE:
 * Member counts below are mock / placeholder values.
 * Replace with real backend-driven counts when community features expand.
 */
const sportMemberCounts: Record<string, number> = {
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
  title: string;
  image: string;
  slug: string;
  memberCount: number;
  className: string;
  onNavigate: (slug: string) => void;
  isDisabled: boolean;
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ title, image, slug, memberCount, className, onNavigate, isDisabled }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
        onNavigate(slug);
      }
    };

    const handleClick = () => {
      trackEvent("community_page_click", { sport: title, slug });
      onNavigate(slug);
    };

    return (
      <div
        className={className}
        onClick={!isDisabled ? handleClick : undefined}
        tabIndex={isDisabled ? -1 : 0}
        role="button"
        aria-disabled={isDisabled}
        aria-label={`Go to ${title} community page`}
        aria-describedby={isDisabled ? `${slug}-disabled` : undefined}
        title={isDisabled ? "Coming soon!" : `Go to ${title} community`}
        onKeyDown={handleKeyDown}
      >
        <div className="sport-card-bg">
          <img
            src={image}
            alt={`Background for ${title}`}
            className="sport-card-image"
            loading="lazy"
          />
          {isDisabled && (
            <div
              className="esport-coming-soon-overlay"
              id={`${slug}-disabled`}
            >
              <span>Coming soon</span>
            </div>
          )}
        </div>

        <div className="sport-card-info">
          <h3>{title}</h3>
          <p className="sport-card-members">
            {memberCount.toLocaleString()} members
          </p>
        </div>
      </div>
    );
  }
);

const Community: React.FC = () => {
  const { sports } = useSports();
  const [searchQuery] = useState(""); // kept for future search feature
  const navigate = useNavigate();

  const filteredSports = useMemo(() => {
    if (!searchQuery.trim()) return sports;
    const q = searchQuery.toLowerCase();
    return sports.filter((sport) => sport.title.toLowerCase().includes(q));
  }, [sports, searchQuery]);

  const handleNavigation = useCallback(
    (slug: string) => {
      navigate(`/community/${slug}`);
    },
    [navigate]
  );

  const getCardClass = (title: string, idx: number) => {
    const base = `sport-card sport-card-${idx % 4}`;
    const isEsports = title.toLowerCase() === "e-sports";
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

      <div className="sports-masonry">
        {filteredSports.map((sport, index) => {
          const slug = slugifySportName(sport.title);
          const isEsports = sport.title.toLowerCase() === "e-sports";

          return (
            <SportCard
              key={sport.title}
              title={sport.title}
              image={sport.backgroundImage}
              slug={slug}
              memberCount={sportMemberCounts[sport.title] || 0}
              className={getCardClass(sport.title, index)}
              onNavigate={handleNavigation}
              isDisabled={isEsports}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default Community;
