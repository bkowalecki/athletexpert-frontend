import React, { useState } from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="logo">
        <h1>AthleteXpert</h1>
      </div>
      <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <a href="#explore">Explore</a>
        <a href="#profile">Profile</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="hamburger-menu" onClick={toggleMobileMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </header>
  );
};

export default Header;
