import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* <div className="footer-logo">
            <Link to="/">
              <h2>AthleteXpert</h2>
            </Link>
          </div> */}
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms and Conditons</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About</Link>
          </div>
          {/* <div className="social-media">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div> */}
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} AthleteXpert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
