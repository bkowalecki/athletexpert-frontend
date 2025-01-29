import React, { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../styles/HeroSection.css";

interface HeroSectionProps {
  openQuiz: () => void; // Define openModal prop
}

const HeroSection: React.FC<HeroSectionProps> = ({ openQuiz }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAuthenticated } = useAuth0();
  const userContext = useContext(UserContext);

if (!userContext) {
  throw new Error("UserContext must be used within a UserProvider");
}

const { user } = userContext; // ✅ Now TypeScript knows `user` is defined

  const profileUrl = isAuthenticated || user ? "/profile" : "/auth"; // ✅ Redirect based on login status


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
        <h1>Gear Tailored to You</h1>
        <div className="cta-buttons">
          <button className="cta-btn" onClick={openQuiz}>Get Your Gear</button>
          <a href={profileUrl}>
            <button className="cta-btn cta-btn-secondary">Profile</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
