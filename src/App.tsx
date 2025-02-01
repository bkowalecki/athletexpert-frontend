import React, { useState } from "react";
import "./styles/App.css"; // Main app styles
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
import Login from "./components/Login";
import TermsAndConditionsPage from "./components/TermsAndConditions";
import BlogPage from "./components/BlogPage";
import SearchResults from "./components/SearchResults";
import Footer from "./components/Footer";
import BlogPostPage from "./components/BlogPostPage";
import AuthPage from "./components/AuthPage";
import { UserProvider } from "./context/UserContext";
import { Auth0Provider } from "@auth0/auth0-react";

// Create the QueryClient instance
const queryClient = new QueryClient();

const App: React.FC = () => {
  const [favoriteColor, setFavoriteColor] = useState<string | null>(null);
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);

  const domain: string = process.env.REACT_APP_AUTH0_DOMAIN ?? "";
  const clientId: string = process.env.REACT_APP_AUTH0_CLIENT_ID ?? "";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + "/auth/callback",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Router>
            <div className="App">
              <Header />
              <Routes>
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
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/terms-of-service" element={<TermsAndConditionsPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </UserProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
};

export default App;
