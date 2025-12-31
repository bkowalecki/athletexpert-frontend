import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import "../styles/four0fourPage.css";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);

  // A11y: move focus to the main landmark on mount (helps keyboard + screen readers)
  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  return (
    <main className="not-found-main" role="main" tabIndex={-1} ref={mainRef}>
      <motion.div
        className="not-found-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        aria-labelledby="not-found-title"
        aria-describedby="not-found-message"
      >
        <Helmet>
          <title>AthleteXpert | Page Not Found</title>
          <meta
            name="description"
            content="Oops! Looks like you've dribbled out of bounds. Let's get you back on track!"
          />
        </Helmet>

        <h1 id="not-found-title" className="not-found-title">
          404
        </h1>
        <p id="not-found-message" className="not-found-message">
          Oops! It looks like you've dribbled out of bounds.
        </p>

        <motion.button
          type="button"
          className="go-home-button"
          aria-label="Go back to AthleteXpert homepage"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
        >
          Go Back Home
        </motion.button>

        {/* SEO and no-JS fallback */}
        <noscript>
          <Link to="/" className="go-home-link">
            Home
          </Link>
        </noscript>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
