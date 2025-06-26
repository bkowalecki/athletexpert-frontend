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
      video.setAttribute("muted", ""); // Important for Safari
      video.setAttribute("playsInline", "true");
      video.setAttribute("autoplay", "");
      video.setAttribute("preload", "auto");

      const tryPlay = () => {
        video
          .play()
          .catch(() => {
            const attemptPlay = () => {
              video.play().catch((err) =>
                console.error("Video failed to autoplay after user gesture:", err)
              );
              document.removeEventListener("click", attemptPlay);
              document.removeEventListener("touchstart", attemptPlay);
            };
            document.addEventListener("click", attemptPlay, { once: true });
            document.addEventListener("touchstart", attemptPlay, { once: true });
          });
      };

      tryPlay();
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
        <source src="/video/New-Hero-Video.webm" type="video/webm" />
        <source src="/video/Hero-Video-MP4.mp4" type="video/mp4" />
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
