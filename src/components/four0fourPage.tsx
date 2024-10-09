import React from "react";
import { Link } from "react-router-dom";
import "../styles/four0fourPage.css"; // 404 page styles

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Oops! It looks like you've dribbled out of bounds.</p>
      <Link to="/" className="home-link">
        <button className="go-home-button">Go Back Home</button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
