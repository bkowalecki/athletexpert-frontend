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
  {
    href: "https://twitter.com/athletexpert",
    label: "Twitter/X",
    icon: "fab fa-x-twitter",
  },
  {
    href: "https://instagram.com/athletexpert",
    label: "Instagram",
    icon: "fab fa-instagram",
  },
  {
    href: "https://pinterest.com/athletexpert", // Pinterest link
    label: "Pinterest",
    icon: "fab fa-pinterest", // Pinterest icon
  },
];

const Footer: React.FC = () => {
  const { pathname } = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo/Brand */}
          <div className="footer-logo">
            <Link to="/" aria-label="Home" onClick={handleLogoClick}>
              <h2>AthleteXpert</h2>
            </Link>
          </div>
          {/* Navigation Links */}
          <nav className="footer-links" aria-label="Footer navigation">
            {footerLinks.map(({ path, label }) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </nav>
          {/* Social Links */}
          <div
            className="social-media"
            style={{ display: "flex", gap: 22, marginTop: 2 }}
          >
            {socialLinks.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow AthleteXpert on ${label}`}
                style={{
                  color: "#f7f7f7",
                  fontSize: 22,
                  transition: "color 0.18s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#A23C20")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#f7f7f7")}
              >
                <i className={icon} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} AthleteXpert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);