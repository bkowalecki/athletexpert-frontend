import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 875);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  /** ✅ Clicking "Profile" should go to `/profile` if logged in, otherwise `/auth` */
  const handleProfileClick = () => {
    if (!isSessionChecked) return; // 🔹 wait until session check finishes

    if (user) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }

    closeMobileMenu(); // Close mobile menu after clicking
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

        {/* 🛠 Updated Profile button */}
        <Link
          to="/profile"
          className="nav-link"
          onClick={() => {
            trackEvent("nav_click", { section: "Profile" });
            handleProfileClick();
          }}
        >
          Profile
        </Link>
      </nav>

      <div
        className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        role="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <div className={`bar ${isMobileMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMobileMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMobileMenuOpen ? "open" : ""}`}></div>
      </div>
    </header>
  );
};

export default Header;
