import React from "react";
import "../styles/AboutPage.css";

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <div className="hero-section-about">
        <div className="hero-content">
          <h1 className="hero-title">Discover the Future of Sports Innovation</h1>
          <p className="hero-description">
            We aren't just about sports gear. We are shaping the future of athletics with cutting-edge technology, 
            expert insights, and world-class products. From grassroots to greatness, we’re with you every step of the way.
          </p>
          <button className="hero-button">Join the Movement</button>
        </div>
      </div>

      {/* Expanded Sections */}
      <div className="about-sections">
        <div className="about-card">
          <h2 className="card-title">Our Mission</h2>
          <p className="card-description">
            At AthleteXpert, our mission is to inspire athletes around the globe by delivering premium sports gear, 
            training technology, and insights to help you achieve your peak performance. We're driven by innovation, 
            pushing the boundaries of what's possible.
          </p>
        </div>

        <div className="about-card highlight-card">
          <h2 className="card-title">Why We're Different</h2>
          <p className="card-description">
            We don’t settle for the ordinary. Our curated selection of sports products are handpicked by elite athletes and 
            trainers to ensure you're getting the very best. Plus, our integration of smart technology lets you track, improve, 
            and dominate your game.
          </p>
        </div>

        <div className="about-card">
          <h2 className="card-title">Be Part of the Legacy</h2>
          <p className="card-description">
            AthleteXpert isn't just a brand; it's a community. A community where athletes from around the world come to improve, 
            share, and inspire. Join us and gain access to exclusive events, content, and cutting-edge products before anyone else.
          </p>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="team-section">
        <h2 className="section-title">Meet Our Team</h2>
        <p className="team-description">
          Our team consists of passionate athletes, technologists, and sports enthusiasts working together to bring you the best in sports innovation.
        </p>
        <div className="team-members">
          <div className="team-member">
            <img src="team-member1.jpg" alt="John Doe" className="team-image" />
            <h3>John Doe</h3>
            <p>CEO & Founder</p>
          </div>
          <div className="team-member">
            <img src="team-member2.jpg" alt="Jane Smith" className="team-image" />
            <h3>Jane Smith</h3>
            <p>Head of Innovation</p>
          </div>
          <div className="team-member">
            <img src="team-member3.jpg" alt="Chris Evans" className="team-image" />
            <h3>Chris Evans</h3>
            <p>Lead Athlete Consultant</p>
          </div>
        </div>
      </div> */}

      {/* Core Values Section */}
      <div className="values-section">
        <h2 className="section-title">Our Core Values</h2>
        <div className="values-list">
          <div className="value-item">
            <h3>Excellence</h3>
            <p>We pursue excellence in everything we do. From product development to customer service, we strive for the best.</p>
          </div>
          <div className="value-item">
            <h3>Innovation</h3>
            <p>We’re constantly pushing the boundaries to bring new, cutting-edge solutions to athletes worldwide.</p>
          </div>
          <div className="value-item">
            <h3>Community</h3>
            <p>AthleteXpert is built on a community of athletes who are passionate about sports and improving together.</p>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="testimonial-section">
        <h2 className="section-title">What Athletes Are Saying</h2>
        <div className="testimonials">
          <div className="testimonial-card">
            <p className="testimonial-text">
              "AthleteXpert has transformed how I approach my training. The products and insights are second to none!"
            </p>
            <p className="testimonial-author">— Alex Johnson, Pro Basketball Player</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "The combination of expert knowledge and top-quality gear has made a huge difference in my performance."
            </p>
            <p className="testimonial-author">— Sarah Lee, Triathlete</p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      {/* <div className="call-to-action-section">
        <h3 className="cta-text">Are You Ready to Reach New Heights?</h3>
        <button className="cta-button">Let’s Connect</button>
      </div> */}
    </div>
  );
};

export default AboutPage;
