// SportStatsModal.tsx
import React from "react";
import "../../styles/SportStatsModal.css";

interface SportStatsModalProps {
  sport: string;
  onClose: () => void;
}

const SportStatsModal: React.FC<SportStatsModalProps> = ({ sport, onClose }) => {
  return (
    <div className="sport-modal-overlay" onClick={onClose}>
      <div className="sport-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sport-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="sport-modal-title">{sport} Stats Dashboard</h2>
        <ul className="sport-stats-list">
          <li>🏆 Total Saved Gear: <strong>12</strong></li>
          <li>📚 Related Blogs Read: <strong>4</strong></li>
          <li>🧠 Knowledge Level: <strong>Intermediate</strong></li>
          <li>🔥 Badge Earned: <strong>"Rising Star"</strong></li>
        </ul>
        <p className="sport-modal-footer">More advanced analytics coming soon!</p>
      </div>
    </div>
  );
};

export default SportStatsModal;
