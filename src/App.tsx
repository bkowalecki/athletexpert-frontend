import React, { useState } from 'react';
import './styles/App.css';  // Main app styles
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturedProductList from './components/FeaturedProductList';
import TrendingProductList from './components/TrendingProductList';
import QuizModal from './components/QuizModal';
import Quiz from './components/Quiz';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Correct import

const App: React.FC = () => {
  const [favoriteColor, setFavoriteColor] = useState<string | null>(null); // State to track favorite color
  const [isQuizModalOpen, setQuizModalOpen] = useState(false); // State to manage modal visibility

  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);

  return (
    <Router> {/* Make sure everything is wrapped in BrowserRouter */}
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection openModal={openModal} /> {/* Pass openModal to HeroSection */}
              <main>
                <FeaturedProductList />
                {/* <TrendingProductList /> */}
              </main>
              <QuizModal
                isOpen={isQuizModalOpen}
                closeModal={closeModal}
              />
            </>
          } />
          {/* Other Routes like SignUp, Login, etc., would go here */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
