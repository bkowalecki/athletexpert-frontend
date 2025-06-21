import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/PwaNav.css";

const PwaNav: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  const getClassName = (path: string) =>
    pathname === path || pathname.startsWith(path) ? "active" : "";

  return (
    <nav className="pwa-nav">
      <Link to="/" className={getClassName("/")}>
        <i className="fas fa-home" />
      </Link>
      <Link to="/blog" className={getClassName("/blog")}>
        <i className="fas fa-newspaper" />
      </Link>
      <div className="pwa-nav-center-button-wrapper">
        <Link to="/search" className={`search-button ${getClassName("/search")}`}>
          <i className="fas fa-search" />
        </Link>
      </div>
      <Link to="/products" className={getClassName("/products")}>
        <i className="fas fa-box-open" />
      </Link>
      <Link to="/profile" className={getClassName("/profile") || getClassName("/auth")}>
        <i className="fas fa-user" />
      </Link>
    </nav>
  );
};

export default PwaNav;
