// EsportExperience.tsx
import React from "react";
import { motion } from "framer-motion";
import "../../styles/EsportPage.css";

interface EsportExperienceProps {
  sport: {
    title: string;
    backgroundImage: string;
    extra_data: {
      summary?: string;
      fun_fact?: string;
    };
  };
}

const popularGames = [
  { title: "League of Legends", players: "150M+", image: "/images/esports/league_of_legends.png" },
  { title: "Valorant", players: "30M+", image: "/images/esports/valorant.png" },
  { title: "Counter-Strike 2", players: "35M+", image: "/images/esports/cs2.jpg" },
  { title: "Fortnite", players: "250M+", image: "/images/esports/fortnite.jpg" },
  { title: "Dota 2", players: "7.6M+", image: "/images/esports/dota2.jpg" },
  { title: "Call of Duty", players: "110M+", image: "/images/esports/cod.jpg" },
  { title: "Overwatch 2", players: "25M+", image: "/images/esports/ow2.jpg" },
  { title: "Apex Legends", players: "130M+", image: "/images/esports/apex.jpg" },
  { title: "PUBG", players: "400M+", image: "/images/esports/pubg.jpg" },
  { title: "Rocket League", players: "90M+", image: "/images/esports/rocketleague.jpg" },
];

const EsportExperience: React.FC<EsportExperienceProps> = ({ sport }) => {
  return (
    <div className="esport-page">
      <div
        className="esport-hero"
        style={{ backgroundImage: `url(${sport.backgroundImage})` }}
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

      <section className="esport-section">
  <h2 className="esport-section-title">🔥 Top 10 Esports & Games</h2>
  <div className="esport-overlay-grid">
    {popularGames.map((game, index) => (
      <div key={index} className="esport-overlay-card">
        <img src={game.image} alt={game.title} className="esport-overlay-image" />
        <div className="esport-overlay-info">
          <h3>{game.title}</h3>
          <p>{game.players}</p>
        </div>
      </div>
    ))}
  </div>
</section>

      <section className="esport-section">
        <h2 className="esport-section-title">👾 Fun Fact</h2>
        <div className="esport-funfact">
          {sport.extra_data.fun_fact ||
            "Did you know esports players train up to 10 hours a day just like traditional athletes?"}
        </div>
      </section>

      <section className="esport-section">
        <h2 className="esport-section-title">🛠 Gear for Gamers</h2>
        <p className="esport-section-text">Mice. Monitors. Glasses. Chair tech. You name it.</p>
      </section>

      <section className="esport-section">
        <h2 className="esport-section-title">📈 Meta Watch</h2>
        <p className="esport-section-text">Patch notes. Strategy shifts. What’s hot right now?</p>
      </section>
    </div>
  );
};

export default EsportExperience;
