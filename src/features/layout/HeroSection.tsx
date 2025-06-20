import React, { useEffect, useRef } from "react";
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
  const { isAuthenticated } = useAuth0();
  const { user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!isSessionChecked) return;
    navigate(user ? "/profile" : "/auth");
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.muted = true;
      videoElement.setAttribute("playsinline", "true");

      videoElement.play().catch(() => {
        const tryPlayOnInteraction = () => {
          videoElement.play().catch((err) =>
            console.error("Still couldn't play:", err)
          );
          document.removeEventListener("touchstart", tryPlayOnInteraction);
          document.removeEventListener("scroll", tryPlayOnInteraction);
        };

        document.addEventListener("touchstart", tryPlayOnInteraction, {
          once: true,
        });
        document.addEventListener("scroll", tryPlayOnInteraction, {
          once: true,
        });
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
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;