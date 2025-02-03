import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from '../context/UserContext';
import '../styles/Header.css';
import HeaderSearchBar from './HeaderSearchBar';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const userContext = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 875);
  const navigate = useNavigate();

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = userContext;

  // ✅ Unified authentication check
  const isLoggedIn = isAuthenticated || user;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 875);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

      {!isMobile && (
        <div className="desktop-search">
          <HeaderSearchBar showSubmitButton={true} />
        </div>
      )}

      <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {isMobile && (
          <div className="mobile-search">
            <HeaderSearchBar
              showSubmitButton={false}
              onSearchComplete={closeMobileMenu}
            />
          </div>
        )}

        <Link
          to={isLoggedIn ? "/profile" : "/auth"} // ✅ Unified login check
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
