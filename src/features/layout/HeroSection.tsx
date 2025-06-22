import React, { useEffect, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../util/analytics";
import "../../styles/HeroSection.css";

interface HeroSectionProps {
  openQuiz: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ openQuiz }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAuthenticated } = useAuth0(); // retained for potential future use
  const { user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();

  const handleProfileClick = useCallback(() => {
    if (!isSessionChecked) return;
    navigate(user ? "/profile" : "/auth");
  }, [isSessionChecked, navigate, user]);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.muted = true;
      video.setAttribute("playsinline", "true");

      video.play().catch(() => {
        const attemptPlay = () => {
          video.play().catch((err) =>
            console.error("Video still failed to play:", err)
          );
          document.removeEventListener("touchstart", attemptPlay);
          document.removeEventListener("scroll", attemptPlay);
        };

        document.addEventListener("touchstart", attemptPlay, { once: true });
        document.addEventListener("scroll", attemptPlay, { once: true });
      });
    }
  }, []);

  return (
    <div className="hero-section" role="banner">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero-poster.png"
        className="hero-video"
      >
        <source src="/video/athletexpertheadervideo.webm" type="video/webm" />
        <source src="/video/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="hero-content">
        <h1>Where Athletes Find Their Edge.</h1>
        <div className="cta-buttons">
          <button
            className="cta-btn"
            onClick={() => {
              trackEvent("quiz_start", { location: "hero_section" });
              openQuiz();
            }}
          >
            Get Your Gear
          </button>
          <button
            className="cta-btn cta-btn-secondary"
            onClick={handleProfileClick}
            aria-label="Go to your profile or log in"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
