import React from "react";
import { motion } from "framer-motion";
import "../../styles/EsportPage.css";

interface EsportExperienceProps {
  sport: {
    title: string;
    backgroundImage: string;
    extra_data?: {
      summary?: string;
      fun_fact?: string;
    };
  };
}

interface Game {
  title: string;
  players: string;
  image: string;
}

const popularGames: Game[] = [
  { title: "League of Legends", players: "150M+", image: "/images/esports/league_of_legends.png" },
  { title: "Valorant", players: "30M+", image: "/images/esports/valorant.png" },
  { title: "Counter-Strike 2", players: "35M+", image: "/images/esports/cs2.png" },
  { title: "Fortnite", players: "250M+", image: "/images/esports/fortnite.png" },
  { title: "Dota 2", players: "7.6M+", image: "/images/esports/dota2.png" },
  { title: "Call of Duty", players: "110M+", image: "/images/esports/cod.png" },
  { title: "Overwatch 2", players: "25M+", image: "/images/esports/ow2.png" },
  { title: "Apex Legends", players: "130M+", image: "/images/esports/apex.png" },
  { title: "PUBG", players: "400M+", image: "/images/esports/pubg.png" },
  { title: "Rocket League", players: "90M+", image: "/images/esports/rocketleague.png" },
];

const EsportExperience: React.FC<EsportExperienceProps> = ({ sport }) => {
  const funFact =
    sport.extra_data?.fun_fact ||
    "Did you know esports players train up to 10 hours a day just like traditional athletes?";

  return (
    <main className="esport-page">
      {/* Hero */}
      <div
        className="esport-hero"
        style={{
          backgroundImage: `url(${sport.backgroundImage})`,
          backgroundColor: "#0a0a0a",
        }}
        aria-label={`${sport.title} esports overview`}
      >
        <div className="esport-overlay">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="esport-title-glitch"
          >
            {sport.title}
          </motion.h1>
        </div>
      </div>

      {/* Top Games */}
      <section className="esport-section" aria-labelledby="top-games-title">
        <h2 id="top-games-title" className="esport-section-title">
          Top 10 Games
        </h2>

        <div className="esport-overlay-grid">
          {popularGames.map((game) => (
            <div key={game.title} className="esport-overlay-card">
              <img
                src={game.image}
                alt={`${game.title} key art`}
                className="esport-overlay-image"
                loading="lazy"
              />
              <div className="esport-overlay-info">
                <h3>{game.title}</h3>
                <p>{game.players} players</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fun Fact */}
      <section className="esport-section" aria-labelledby="fun-fact-title">
        <h2 id="fun-fact-title" className="esport-section-title">
          👾 Fun Fact
        </h2>
        <div className="esport-funfact">{funFact}</div>
      </section>

      {/* Gear */}
      <section className="esport-section" aria-labelledby="gear-title">
        <h2 id="gear-title" className="esport-section-title">
          🛠 Gear for Gamers
        </h2>
        <p className="esport-section-text">
          Mice. Monitors. Glasses. Chair tech. You name it.
        </p>
      </section>

      {/* Meta */}
      <section className="esport-section" aria-labelledby="meta-title">
        <h2 id="meta-title" className="esport-section-title">
          📈 Meta Watch
        </h2>
        <p className="esport-section-text">
          Patch notes. Strategy shifts. What’s hot right now?
        </p>
      </section>
    </main>
  );
};

export default EsportExperience;
