import React from "react";
import "../../styles/ContactPage.css";
import { Helmet } from "react-helmet";

interface ContactBoxProps {
  title: string;
  description: string;
}

const ContactBox: React.FC<ContactBoxProps> = ({ title, description }) => (
  <div className="contact-box" tabIndex={0} aria-label={title}>
    <h2 className="contact-box-title">{title}</h2>
    <p className="contact-box-desc">{description}</p>
  </div>
);

const ContactPage: React.FC = () => {
  return (
    <div className="contact-wrapper">
      <Helmet>
        <title>Contact | AthleteXpert</title>
        <meta
          name="description"
          content="Reach AthleteXpert for partnerships, support, or media. We're here for athletes, brands, and fans."
        />
      </Helmet>

      <header className="contact-header" role="banner">
        <h1>Contact</h1>
        <p>
          Have questions, ideas, or just want to connect? We’d love to hear from
          you!
        </p>
      </header>

      <main className="contact-main" role="main">
        <section className="contact-email" aria-label="Email Contact">
          <p>
            Email us:
            <br />
            <a
              href="mailto:contact@athletexpert.org"
              aria-label="Send an email to contact@athletexpert.org"
            >
              contact@athletexpert.org
            </a>
          </p>
          {/* Optionally add phone or chat later */}
          {/* <p>Or call: <a href="tel:1234567890">123-456-7890</a></p> */}
        </section>

        <section className="contact-links" aria-label="Contact Reasons">
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
