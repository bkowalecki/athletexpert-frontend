import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Footer.css";

const footerLinks = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-and-conditions", label: "Terms & Conditions" },
  { path: "/contact", label: "Contact" },
  { path: "/about", label: "About" },
];

const socialLinks = [
  { href: "https://twitter.com/athletexpert", label: "Twitter/X", icon: "fab fa-x-twitter" },
  { href: "https://instagram.com/athletexpert", label: "Instagram", icon: "fab fa-instagram" },
  { href: "https://pinterest.com/athletexpert", label: "Pinterest", icon: "fab fa-pinterest" },
];

const Footer: React.FC = () => {
  const { pathname } = useLocation();

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/" aria-label="Home" onClick={handleLogoClick}>
              <h2>AthleteXpert</h2>
            </Link>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            {footerLinks.map(({ path, label }) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="social-media">
            {socialLinks.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow AthleteXpert on ${label}`}
              >
                <i className={icon} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AthleteXpert. All rights reserved.</p>
          <p className="affiliate-disclaimer">
            As an Amazon Associate, AthleteXpert earns from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
