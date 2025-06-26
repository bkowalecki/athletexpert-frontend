import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { trackEvent } from "../../util/analytics";
import "../../styles/Header.css";
import HeaderSearchBar from "../search/HeaderSearchBar";

type MenuState = "closed" | "open" | "closing";

const navLinks = [
  { path: "/community", label: "Community" },
  { path: "/products", label: "Products" },
  { path: "/blog", label: "Blog" },
];

const Header: React.FC = () => {
  const { user, isSessionChecked } = useUserContext();
  const { isAuthenticated } = useAuth0();
  const [menuState, setMenuState] = useState<MenuState>("closed");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 875);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const isMenuVisible = menuState === "open" || menuState === "closing";

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 875);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMenuVisible && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState("closing");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuVisible]);

  const toggleMobileMenu = () => {
    setMenuState(prev =>
      prev === "open" ? "closing" : prev === "closed" ? "open" : prev
    );
  };

  const closeMobileMenu = () => {
    if (isMobile && menuState === "open") setMenuState("closing");
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
          <HeaderSearchBar showSubmitButton />
        </div>
      )}

      <nav
        ref={menuRef}
        className={`nav-links ${
          menuState === "open"
            ? "mobile-menu-open"
            : menuState === "closing"
            ? "mobile-menu-closing"
            : ""
        }`}
        aria-label="Primary Navigation"
        id="main-navigation"
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform" && menuState === "closing") {
            setMenuState("closed");
          }
        }}
      >
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar showSubmitButton={false} onSearchComplete={closeMobileMenu} />
          </div>
        )}

        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="nav-link"
            onClick={() => {
              trackEvent("nav_click", { section: label });
              closeMobileMenu();
            }}
          >
            {label}
          </Link>
        ))}

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
        className="hamburger-menu"
        onClick={toggleMobileMenu}
        role="button"
        aria-label="Toggle navigation menu"
        aria-controls="main-navigation"
        aria-expanded={menuState === "open"}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className={`bar ${menuState === "open" ? "open" : ""}`} />
        ))}
      </div>
    </header>
  );
};

export default Header;
