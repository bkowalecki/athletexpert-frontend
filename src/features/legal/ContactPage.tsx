import React from "react";
import "../../styles/ContactPage.css";

interface ContactBoxProps {
  title: string;
  description: string;
}

const ContactBox: React.FC<ContactBoxProps> = ({ title, description }) => (
  <div className="contact-box">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);

const ContactPage: React.FC = () => {
  return (
    <div className="contact-wrapper">
      <header className="contact-header" role="banner">
        <h1>Contact</h1>
      </header>

      <main className="contact-main" role="main">
        <section className="contact-email">
          <p>
            Reach us at:
            <br />
            <a
              href="mailto:contact@athletexpert.org"
              aria-label="Send an email to contact@athletexpert.org"
            >
              contact@athletexpert.org
            </a>
          </p>
        </section>

        <section className="contact-links">
          <ContactBox
            title="Partnerships"
            description="Let’s collaborate on something impactful."
          />
          <ContactBox
            title="Support"
            description="We’re all ears for bugs, fixes, and ideas."
          />
          <ContactBox
            title="Media"
            description="For press and professional inquiries."
          />
        </section>
      </main>
    </div>
  );
};

export default ContactPage;