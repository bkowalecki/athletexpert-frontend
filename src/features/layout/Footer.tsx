import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Footer.css";

const Footer: React.FC = () => (
  <footer className="app-footer">
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-logo">
          <Link to="/">
            <h2>AthleteXpert</h2>
          </Link>
        </div>
        <div className="footer-links">
          {["privacy-policy", "terms-and-conditions", "contact", "about"].map((path) => (
            <Link key={path} to={`/${path}`}>
              {path.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
            </Link>
          ))}
        </div>
        <div className="social-media">
          {[
            { href: "https://twitter.com", label: "Twitter", icon: "fab fa-x-twitter" },
            { href: "https://instagram.com", label: "Instagram", icon: "fab fa-instagram" },
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <i className={icon}></i>
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AthleteXpert. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;