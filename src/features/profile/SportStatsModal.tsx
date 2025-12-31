import React, { useEffect, useMemo, useRef } from "react";
import { sportStatsMap } from "../../data/sportStats";
import "../../styles/SportStatsModal.css";

interface SportStatsModalProps {
  sport: string;
  onClose: () => void;
}

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  goal?: number;
}

interface SportStatsConfig {
  icon: string;
  title: string;
  stats: StatItem[];
  badge: string;
  tip?: string;
  tips?: string[];
  funFact?: string;
}

const fallbackConfig: SportStatsConfig = {
  icon: "🏅",
  title: "All Sports",
  stats: [
    { label: "Total Activities", value: 0 },
    { label: "Knowledge Level", value: "Beginner" },
    { label: "Badge Earned", value: "Rising Star" },
  ],
  badge: "Multi-Sport Athlete",
  tip: "Start logging activity to see your stats!",
};

const SportStatsModal: React.FC<SportStatsModalProps> = ({ sport, onClose }) => {
  // Resolve config safely
  const config: SportStatsConfig = useMemo(
    () => (sportStatsMap[sport] as SportStatsConfig) || fallbackConfig,
    [sport]
  );

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollY = window.scrollY;

    // Lock background scroll
    document.body.style.top = `-${scrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.overflowY = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    // Focus first actionable element
    setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 150);

    return () => {
      document.body.style.position = "";
      document.body.style.overflowY = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="sport-modal-overlay enhanced"
      role="dialog"
      aria-modal="true"
      aria-label={`${config.title} stats modal`}
      onClick={onClose}
    >
      <div
        className="sport-modal enhanced"
        ref={modalRef}
        onClick={handleModalClick}
      >
        <button
          className="sport-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="sport-modal-header">
          <span className="sport-modal-sporticon">{config.icon}</span>
          <h2 className="sport-modal-title">{config.title} Stats</h2>
        </div>

        {config.funFact && (
          <div className="sport-modal-funfact">
            🏆 <strong>Did you know?</strong> {config.funFact}
          </div>
        )}

        <ul className="sport-stats-list">
          {config.stats.map((stat, i) => (
            <li key={i} className="sport-stat-row">
              <span>{stat.label}: </span>
              <strong>
                {typeof stat.value === "number" && stat.goal ? (
                  <>
                    <span style={{ marginRight: 8 }}>
                      {stat.value}/{stat.goal}
                      {stat.unit && ` ${stat.unit}`}
                    </span>
                    <span
                      className="stat-progress-bar-wrap"
                      aria-label={`Progress: ${stat.value}/${stat.goal}`}
                    >
                      <span className="stat-progress-bar-bg">
                        <span
                          className="stat-progress-bar-fg"
                          style={{
                            width: `${Math.min(
                              100,
                              (stat.value / stat.goal) * 100
                            )}%`,
                          }}
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

        {config.tips && (
          <div className="sport-modal-tips">
            <h3>Pro Tips</h3>
            <ul>
              {config.tips.map((tip, idx) => (
                <li key={idx}>💡 {tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="sport-badge-row" tabIndex={0}>
          <span className="sport-badge">
            {config.badge}
            <svg
              className="badge-spark-svg"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <defs>
                <radialGradient id="gold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="100%" stopColor="#fff0" />
                </radialGradient>
              </defs>
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="url(#gold)"
                style={{
                  animation: "badgeSparkPulse 1.12s infinite alternate",
                  transformOrigin: "center center",
                }}
              />
            </svg>
          </span>
        </div>

        {config.tip && (
          <p className="sport-modal-tip">💡 {config.tip}</p>
        )}

        <p className="sport-modal-footer">
          More advanced analytics and leaderboards coming soon!
        </p>
      </div>
    </div>
  );
};

export default SportStatsModal;
