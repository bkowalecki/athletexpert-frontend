import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Footer.css";

// Centralize your links for easier edits/expansion
const footerLinks = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-and-conditions", label: "Terms & Conditions" },
  { path: "/contact", label: "Contact" },
  { path: "/about", label: "About" }
];

const socialLinks = [
  {
    href: "https://twitter.com",
    label: "Twitter (X)",
    icon: "fab fa-x-twitter"
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: "fab fa-instagram"
  }
];

const Footer: React.FC = () => (
  <footer className="app-footer" role="contentinfo">
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-logo">
          <Link to="/" aria-label="Home">
            <h2>AthleteXpert</h2>
          </Link>
        </div>
        <nav className="footer-links" aria-label="Footer links">
          {footerLinks.map(({ path, label }) => (
            <Link key={path} to={path}>{label}</Link>
          ))}
        </nav>
        <div className="social-media">
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <i className={icon} aria-hidden="true"></i>
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} AthleteXpert. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);
