import React, { useState, useEffect, useContext } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
import AuthCallback from "./components/AuthCallback";
import { UserProvider, UserContext } from "./context/UserContext";
import { Auth0Provider } from "@auth0/auth0-react";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);

  const location = useLocation();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user, setUser } = userContext;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/session`,
          {
            credentials: "include",
          }
        );
  
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          setUser(null); // Clear session if unauthorized
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
  
    checkSession();
  }, [location.pathname]);
  
  
  
  

  return (
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
        <Route path="/auth/callback" element={<AuthCallback />} /> {/* ✅ Add this */}
        <Route path="/search" element={<SearchResults />} />
        <Route path="/terms-of-service" element={<TermsAndConditionsPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
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
            <AppContent />
          </Router>
        </UserProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
};

export default App;
