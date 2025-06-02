import React from "react";
import "../../styles/ContactPage.css";

const ContactPage: React.FC = () => {
  return (
    <div className="contact-wrapper">
      <header className="contact-header">
        <h1>Contact</h1>
      </header>

      <main className="contact-main">
        <section className="contact-email">
          <p>
            Reach us at:
            <br />
            <a href="mailto:contact@athletexpert.org">contact@athletexpert.org</a>
          </p>
        </section>

        <section className="contact-links">
          <div className="contact-box">
            <h2>Partnerships</h2>
            <p>Let’s collaborate on something impactful.</p>
          </div>
          <div className="contact-box">
            <h2>Support</h2>
            <p>We’re all ears for bugs, fixes, and ideas.</p>
          </div>
          <div className="contact-box">
            <h2>Media</h2>
            <p>For press and professional inquiries.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;