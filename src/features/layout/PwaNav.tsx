import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/PwaNav.css";

const PwaNav: React.FC = () => {
  const [showNav, setShowNav] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobile = window.innerWidth <= 768;

    if (isStandalone && isMobile) {
      setShowNav(true);
    }
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
      <Link to="/search" className={pathname === "/search" ? "active" : ""}>
        <i className="fas fa-search" />
      </Link>
      <Link to="/profile" className={pathname === "/profile" ? "active" : ""}>
        <i className="fas fa-user" />
      </Link>
    </nav>
  );
};

export default PwaNav;
