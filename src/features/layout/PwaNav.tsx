import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/PwaNav.css";

const PwaNav: React.FC = () => {
  const [showNav, setShowNav] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkPwaAndMobile = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      const isMobile = window.innerWidth <= 768;
      setShowNav(isStandalone && isMobile);
    };

    checkPwaAndMobile();
    window.addEventListener("resize", checkPwaAndMobile);
    return () => window.removeEventListener("resize", checkPwaAndMobile);
  }, []);

  if (!showNav) return null;

  return (
    <nav className="pwa-nav">
      <Link to="/" className={pathname === "/" ? "active" : ""}>
        <i className="fas fa-home" />
      </Link>
      <Link to="/blog" className={pathname.includes("/blog") ? "active" : ""}>
        <i className="fas fa-newspaper" />
      </Link>
      <div className="pwa-nav-center-button-wrapper">
        <Link
          to="/search"
          className={`search-button ${pathname === "/search" ? "active" : ""}`}
        >
          <i className="fas fa-search" />
        </Link>
      </div>
      <Link to="/products" className={pathname === "/products" ? "active" : ""}>
        <i className="fas fa-box-open" />
      </Link>
      <Link
        to="/profile"
        className={
          pathname.startsWith("/profile") || pathname === "/auth"
            ? "active"
            : ""
        }
      >
        <i className="fas fa-user" />
      </Link>
    </nav>
  );
};

export default PwaNav;
