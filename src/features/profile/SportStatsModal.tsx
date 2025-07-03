// SportStatsModal.tsx
import React, { useEffect, useMemo } from "react";
import { sportStatsMap } from "../../data/sportStats";
import "../../styles/SportStatsModal.css";

interface SportStatsModalProps {
  sport: string;
  onClose: () => void;
}

const fallbackConfig = {
  icon: "🏅",
  title: "All Sports",
  stats: [
    { label: "Total Activities", value: 0 },
    { label: "Knowledge Level", value: "Beginner" },
    { label: "Badge Earned", value: "Rising Star" }
  ],
  badge: "Multi-Sport Athlete",
  tip: "Start logging activity to see your stats!"
};

const SportStatsModal: React.FC<SportStatsModalProps> = ({ sport, onClose }) => {
  // Pick config for this sport or fallback
  const config = useMemo(
    () => sportStatsMap[sport] || fallbackConfig,
    [sport]
  );

  useEffect(() => {
    // Prevent background scroll & lock scroll position
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.overflowY = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="sport-modal-overlay" onClick={onClose}>
      <div className="sport-modal" onClick={e => e.stopPropagation()}>
        <button className="sport-modal-close" onClick={onClose}>&times;</button>
        <div className="sport-modal-header">
          <span className="sport-modal-sporticon">{config.icon}</span>
          <h2 className="sport-modal-title">{config.title} Stats</h2>
        </div>

        {/* Fun Fact / Quote */}
        {config.funFact && (
          <div className="sport-modal-funfact">🏆 <strong>Did you know?</strong> {config.funFact}</div>
        )}

        {/* Stats list */}
        <ul className="sport-stats-list">
          {config.stats.map((stat: any, i: number) => (
            <li key={i} className="sport-stat-row">
              <span>{stat.label}: </span>
              <strong>
                {typeof stat.value === "number" && stat.goal ? (
                  <>
                    <span style={{ marginRight: 8 }}>{stat.value}/{stat.goal}{stat.unit && ` ${stat.unit}`}</span>
                    <span className="stat-progress-bar-wrap">
                      <span className="stat-progress-bar-bg">
                        <span
                          className="stat-progress-bar-fg"
                          style={{ width: `${Math.min(100, (stat.value / stat.goal) * 100)}%` }}
                        />
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    {stat.value}
                    {stat.unit ? ` ${stat.unit}` : ""}
                  </>
                )}
              </strong>
            </li>
          ))}
        </ul>

        {/* Tips */}
        {config.tips && (
          <div className="sport-modal-tips">
            <h3>Pro Tips</h3>
            <ul>
              {config.tips.map((tip: string, idx: number) => (
                <li key={idx}>💡 {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Badge + animated spark */}
        <div className="sport-badge-row">
          <span className="sport-badge">{config.badge}</span>
          <span className="badge-spark" aria-hidden />
        </div>

        {/* “Did You Know?” or tip */}
        {config.tip && <p className="sport-modal-tip">💡 {config.tip}</p>}

        <p className="sport-modal-footer">
          More advanced analytics and leaderboards coming soon!
        </p>
      </div>
    </div>
  );
};

export default SportStatsModal;
