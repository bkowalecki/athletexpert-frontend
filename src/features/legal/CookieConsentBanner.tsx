import React, { useEffect, useState } from "react";
import "../../styles/CookieConsentBanner.css";

const COOKIE_KEY = "ax_cookie_consent";

const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<"enter" | "exit" | "idle">("idle");

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
      // Start enter animation on next tick so CSS transitions apply
      requestAnimationFrame(() => setAnimState("enter"));
    }
  }, []);

  const finalizeHide = () => {
    setVisible(false);
    setAnimState("idle");
  };

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setAnimState("exit");
    // optionally initialize tracking scripts here after a short delay
    setTimeout(finalizeHide, 220);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setAnimState("exit");
    setTimeout(finalizeHide, 220);
  };

  if (!visible) return null;

  return (
    <div
      className={`cookie-banner ${animState === "enter" ? "is-entering" : ""} ${
        animState === "exit" ? "is-exiting" : ""
      }`}
      role="region"
      aria-label="Cookie consent banner"
      aria-live="polite"
      data-testid="cookie-banner"
    >
      <div className="cookie-inner">
        <p className="cookie-text">
          We use cookies to improve your experience, analyze traffic, and
          personalize content. See our{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>

        <div className="cookie-actions" role="group" aria-label="Cookie choices">
          <button type="button" onClick={handleAccept}>
            Accept
          </button>
          <button type="button" onClick={handleDecline} className="decline-btn">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
