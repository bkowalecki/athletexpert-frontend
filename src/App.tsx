import React from 'react';
import './styles/App.css';  // Main app styles
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Quiz from './components/Quiz';
import FeaturedProductList from './components/FeaturedProductList';
import TrendingProductList from './components/TrendingProductList';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <HeroSection/>
      <main>
        <Quiz/>
        <FeaturedProductList />
        <TrendingProductList/>
      </main>
    </div>
  );
};

export default App;
