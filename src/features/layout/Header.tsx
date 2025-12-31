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

const MOBILE_BREAKPOINT = 875;

const Header: React.FC = () => {
  const { user, isSessionChecked } = useUserContext();
  const { isAuthenticated } = useAuth0();
  const [menuState, setMenuState] = useState<MenuState>("closed");
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Responsive check (hydration-safe)
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsHydrated(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll on mobile menu
  useEffect(() => {
    document.body.style.overflow =
      isMobile && menuState === "open" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, menuState]);

  // Outside click closes menu
  useEffect(() => {
    if (!isMobile || menuState !== "open") return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState("closing");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobile, menuState]);

  const toggleMobileMenu = () => {
    setMenuState((prev) =>
      prev === "open" ? "closing" : prev === "closed" ? "open" : prev
    );
  };

  const closeMobileMenu = useCallback(() => {
    if (isMobile && menuState === "open") {
      setMenuState("closing");
    }
  }, [isMobile, menuState]);

  const handleProfileClick = useCallback(() => {
    if (!isSessionChecked) return;
    navigate(user ? "/profile" : "/auth");
    closeMobileMenu();
  }, [isSessionChecked, user, navigate, closeMobileMenu]);

  if (!isHydrated) return null;

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
        id="main-navigation"
        className={`nav-links ${
          menuState === "open"
            ? "mobile-menu-open"
            : menuState === "closing"
            ? "mobile-menu-closing"
            : ""
        }`}
        aria-label="Primary navigation"
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform" && menuState === "closing") {
            setMenuState("closed");
          }
        }}
      >
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar
              showSubmitButton={false}
              onSearchComplete={closeMobileMenu}
            />
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
          onClick={handleProfileClick}
          aria-label="Go to Profile"
        >
          Profile
        </button>
      </nav>

      <div
        className="hamburger-menu"
        role="button"
        tabIndex={0}
        aria-label="Toggle navigation menu"
        aria-controls="main-navigation"
        aria-expanded={menuState === "open"}
        onClick={toggleMobileMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleMobileMenu();
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className={`bar ${menuState === "open" ? "open" : ""}`} />
        ))}
      </div>
    </header>
  );
};

export default React.memo(Header);
