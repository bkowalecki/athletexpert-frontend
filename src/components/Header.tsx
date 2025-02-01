// Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/Header.css';
import HeaderSearchBar from './HeaderSearchBar';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 875);
  const navigate = useNavigate();

  // Listen for window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 875);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle mobile menu open/close
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside the header
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobileMenuOpen && !(e.target as HTMLElement).closest('.app-header')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobileMenuOpen]);

  // Handler to close mobile menu (used for both nav links and search bar)
  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">
          <h1>AthleteXpert</h1>
        </Link>
      </div>

      {/* Desktop search bar */}
      {!isMobile && (
        <div className="desktop-search">
          <HeaderSearchBar showSubmitButton={true} />
        </div>
      )}

      <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {/* Mobile search bar (without submit button), with onSearchComplete closing the menu */}
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar
              showSubmitButton={false}
              onSearchComplete={closeMobileMenu}
            />
          </div>
        )}
        <Link
          to={isAuthenticated ? "/profile" : "/auth"}
          className="nav-link"
          onClick={closeMobileMenu}
        >
          Profile
        </Link>
        <Link
          to="/blog"
          className="nav-link"
          onClick={closeMobileMenu}
        >
          Blog
        </Link>
        <Link
          to="/about"
          className="nav-link"
          onClick={closeMobileMenu}
        >
          About
        </Link>
      </nav>

      <div
        className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
      </div>
    </header>
  );
};

export default Header;
