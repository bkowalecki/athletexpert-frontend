import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { trackEvent } from "../../util/analytics";

import "../../styles/Header.css";
import HeaderSearchBar from "../search/HeaderSearchBar";

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const { user, isSessionChecked } = useUserContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 875);
  const navigate = useNavigate();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 875);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (!isSessionChecked) return;
    navigate(user ? "/profile" : "/auth");
    closeMobileMenu();
  };

  return (
    <header className="app-header">
      <div className="logo">
        <Link
          to="/"
          className="nav-link"
          onClick={() => {
            trackEvent("nav_click", { section: "Home" });
            closeMobileMenu();
          }}
        >
          <h1>AthleteXpert</h1>
        </Link>
      </div>

      {!isMobile && (
        <div className="desktop-search">
          <HeaderSearchBar showSubmitButton={true} />
        </div>
      )}

      <nav
        className={`nav-links ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
        aria-label="Primary Navigation"
        id="main-navigation"
      >
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar
              showSubmitButton={false}
              onSearchComplete={closeMobileMenu}
            />
          </div>
        )}

        <Link
          to="/community"
          className="nav-link"
          onClick={() => {
            trackEvent("nav_click", { section: "Community" });
            closeMobileMenu();
          }}
        >
          Community
        </Link>

        <Link
          to="/products"
          className="nav-link"
          onClick={() => {
            trackEvent("nav_click", { section: "Products" });
            closeMobileMenu();
          }}
        >
          Products
        </Link>

        <Link
          to="/blog"
          className="nav-link"
          onClick={() => {
            trackEvent("nav_click", { section: "Blog" });
            closeMobileMenu();
          }}
        >
          Blog
        </Link>

        <button
          className="nav-link nav-button"
          onClick={() => {
            trackEvent("nav_click", { section: "Profile" });
            handleProfileClick();
          }}
          aria-label="Go to Profile"
        >
          Profile
        </button>
      </nav>

      <div
        className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        role="button"
        aria-label="Toggle navigation menu"
        aria-controls="main-navigation"
        aria-expanded={isMobileMenuOpen}
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </header>
  );
};

export default Header;
