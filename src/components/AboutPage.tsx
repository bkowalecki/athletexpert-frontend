import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AboutPage.css";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthPageNavigation = () => {
    navigate("/auth");
  };

  return (
    <div className="about-page-container">
      <div className="about-page-hero-section">
        <div className="about-page-hero-content">
          <h1 className="about-page-hero-title">
            The Future of Sports Innovation
          </h1>
          <p className="about-page-hero-description">
            From grassroots to greatness, we bring together cutting-edge
            technology, expert insights, and a driven community to help athletes
            at every stage push further and achieve more.
          </p>
          <button
            className="about-page-hero-button"
            onClick={handleAuthPageNavigation}
          >
            Join the Community
          </button>
        </div>
      </div>

      <div className="about-page-sections">
        <div className="about-page-card">
          <h2 className="about-page-card-title">Our Purpose</h2>
          <p className="about-page-card-description">
            We exist to empower athletes. Whether you're just starting or
            competing at the highest level, AthleteXpert is your go-to resource
            for expertly curated gear, in-depth training insights, and a
            supportive community that helps you succeed.
          </p>
        </div>

        <div className="about-page-card about-page-highlight-card">
          <h2 className="about-page-card-title">What Sets Us Apart</h2>
          <p className="about-page-card-description">
            We combine expert-driven recommendations with innovative tracking
            tools, giving athletes a competitive edge. Our curated selection
            ensures that every product we showcase is tested, trusted, and built
            for performance.
          </p>
        </div>

        <div className="about-page-card">
          <h2 className="about-page-card-title">Join the Movement</h2>
          <p className="about-page-card-description">
            AthleteXpert is more than a platform—it's a community. Connect with
            athletes who share your passion, get early access to game-changing
            gear, and take your performance to new heights.
          </p>
        </div>
      </div>

      <div className="about-page-values-section">
        <h2 className="about-page-section-title">Our Core Values</h2>
        <div className="about-page-values-list">
          <div className="about-page-value-item">
            <h3>Excellence</h3>
            <p>
              We aim for the highest standards in everything we do, from product
              curation to community engagement.
            </p>
          </div>
          <div className="about-page-value-item">
            <h3>Innovation</h3>
            <p>
              We embrace new technologies and strategies to enhance athletic
              performance and gear selection.
            </p>
          </div>
          <div className="about-page-value-item">
            <h3>Community</h3>
            <p>
              AthleteXpert is built on a strong foundation of athletes
              supporting athletes.
            </p>
          </div>
        </div>
      </div>

      <div className="about-page-testimonial-section">
        <h2 className="about-page-section-title">What Athletes Say</h2>
        <div className="about-page-testimonials">
          <div className="about-page-testimonial-card">
            <p className="about-page-testimonial-text">
              "AthleteXpert gave me the tools and knowledge to upgrade my
              training like never before."
            </p>
            <p className="about-page-testimonial-author">
              — Alex Johnson, Pro Basketball Player
            </p>
          </div>
          <div className="about-page-testimonial-card">
            <p className="about-page-testimonial-text">
              "The expert recommendations and smart gear insights have helped me
              improve my endurance and performance."
            </p>
            <p className="about-page-testimonial-author">
              — Sarah Lee, Triathlete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
