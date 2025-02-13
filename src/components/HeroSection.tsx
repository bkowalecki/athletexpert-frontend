import React, { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/HeroSection.css";

interface HeroSectionProps {
  openQuiz: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ openQuiz }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAuthenticated } = useAuth0();
  const { user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();

  /** ✅ Clicking "Profile" should go to `/profile` if logged in, otherwise `/auth` */
  const handleProfileClick = () => {
    if (!isSessionChecked) return; // 🔹 Wait for session check before redirecting

    if (isAuthenticated || user) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.muted = true;
      videoElement.setAttribute("playsinline", "true");

      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video playing successfully");
          })
          .catch((error) => {
            console.error("Autoplay blocked, manual play required:", error);
          });
      }
    }
  }, []);

  return (
    <div className="hero-section">
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
        <source src="/video/athletexpertheadervideo.mp4" type="video/mp4" />
        <source src="/video/athletexpertheadervideo.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      <div className="hero-content">
        <h1>Where Athletes Find Their Edge.</h1>
        <div className="cta-buttons">
          <button className="cta-btn" onClick={openQuiz}>
            Get Your Gear
          </button>
          <button className="cta-btn cta-btn-secondary" onClick={handleProfileClick}>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
