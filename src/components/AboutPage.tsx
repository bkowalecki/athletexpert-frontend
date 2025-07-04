import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet"; // For SEO
import "../styles/AboutPage.css";

const coreValues = [
  {
    title: "Excellence",
    description:
      "We aim for the highest standards in everything we do, from product curation to community engagement.",
  },
  {
    title: "Innovation",
    description:
      "We embrace new technologies and strategies to enhance athletic performance and gear selection.",
  },
  {
    title: "Community",
    description:
      "AthleteXpert is built on a strong foundation of athletes supporting athletes.",
  },
];

const testimonials = [
  {
    text:
      "AthleteXpert gave me the tools and knowledge to upgrade my training like never before.",
    author: "Alex Johnson, Pro Basketball Player",
  },
  {
    text:
      "The expert recommendations and smart gear insights have helped me improve my endurance and performance.",
    author: "Sarah Lee, Triathlete",
  },
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthPageNavigation = () => {
    navigate("/auth");
  };

  return (
    <main className="about-page-container" role="main">
      <Helmet>
        <title>About AthleteXpert | The Future of Sports Innovation</title>
        <meta
          name="description"
          content="Discover AthleteXpert—your go-to community for athletes, with expert gear recommendations, training insights, and an empowering athlete network."
        />
      </Helmet>

      <section className="about-page-hero-section">
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
            aria-label="Join AthleteXpert Community"
          >
            Join the Community
          </button>
        </div>
      </section>

      <section className="about-page-sections">
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
      </section>

      <section className="about-page-values-section" aria-labelledby="core-values-title">
        <h2 id="core-values-title" className="about-page-section-title">
          Our Core Values
        </h2>
        <div className="about-page-values-list">
          {coreValues.map((val) => (
            <div className="about-page-value-item" key={val.title}>
              <h3>{val.title}</h3>
              <p>{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-page-testimonial-section" aria-labelledby="testimonials-title">
        <h2 id="testimonials-title" className="about-page-section-title">
          What Athletes Say
        </h2>
        <div className="about-page-testimonials">
          {testimonials.map((t, i) => (
            <div className="about-page-testimonial-card" key={i}>
              <p className="about-page-testimonial-text">{`"${t.text}"`}</p>
              <p className="about-page-testimonial-author">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
