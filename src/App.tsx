import React, { useState } from "react";
import "./styles/App.css"; // Main app styles
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturedProductList from "./components/FeaturedProductList";
import TrendingProductList from "./components/TrendingProductList";
import BlogSection from "./components/BlogSection";
import Quiz from "./components/Quiz";
import ProfilePage from "./components/ProfilePage";
import AboutPage from "./components/AboutPage";
import NotFoundPage from "./components/four0fourPage";
import RegisterPage from "./components/RegisterPage";
import TermsAndConditionsPage from "./components/TermsAndConditions";
import BlogPage from "./components/BlogPage";
import SearchResults from "./components/SearchResults";
import Footer from "./components/Footer";
import BlogPostPage from "./components/BlogPostPage";

const App: React.FC = () => {
  // State for quiz modal visibility and favorite color (if needed elsewhere)
  const [favoriteColor, setFavoriteColor] = useState<string | null>(null);
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Home route */}
          <Route
            path="/"
            element={
              <>
                <HeroSection openQuiz={openModal} />
                <main>
                  <FeaturedProductList />
                  <TrendingProductList />
                  <BlogSection />
                </main>
                <Quiz isOpen={isQuizModalOpen} closeModal={closeModal} />
              </>
            }
          />
          {/* Profile route */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {/* Add more routes here as needed */}
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
};

export default App;
