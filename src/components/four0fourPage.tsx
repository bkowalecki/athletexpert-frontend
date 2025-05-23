import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/four0fourPage.css";
import { Helmet } from "react-helmet";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="not-found-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }} // 👈 fade + slide away when leaving
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>AthleteXpert | Page Not Found</title>
        <meta
          name="description"
          content="Oops! Looks like you've dribbled out of bounds. Let's get you back on track!"
        />
      </Helmet>
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">
        Oops! It looks like you've dribbled out of bounds.
      </p>
      <button className="go-home-button" onClick={() => navigate("/")}>
        Go Back Home
      </button>
    </motion.div>
  );
};

export default NotFoundPage;
