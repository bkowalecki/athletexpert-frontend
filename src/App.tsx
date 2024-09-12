import React from 'react';
import './styles/App.css';  // Main app styles
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Quiz from './components/Quiz';
import ProductList from './components/ProductList';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <HeroSection/>
      <main>
        <Quiz/>
        <ProductList />
      </main>
    </div>
  );
};

export default App;
