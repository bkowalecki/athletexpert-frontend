import React, { useState, useEffect, useContext } from "react";
import "./styles/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

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
import PrivacyPolicy from "./components/PrivacyPolicy";
import AuthCallback from "./components/AuthCallback";
import { UserProvider, UserContext } from "./context/UserContext";
import { Auth0Provider } from "@auth0/auth0-react";
import AccountSettings from "./components/AccountSettings";

import ScrollToTop from "./util/ScrollToTop";
import ProductsPage from "./components/ProductsPage";

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

  const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );

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
        } else {
          setUser(null);
          document.cookie =
            "authToken=; Max-Age=0; path=/; SameSite=None; Secure"; // ✅ Ensure cookie is cleared
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    if (document.cookie.includes("authToken")) {
      // ✅ Only check session if token exists
      checkSession();
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <Header />
      <AnimatePresence mode="wait">
      <Routes>
        <Route
          path="/"
          element={<PageWrapper>
            <>
            
              <HeroSection openQuiz={openModal} />
              <main>
                <FeaturedProductList />
                <TrendingProductList />
                <BlogSection />
              </main>
              <Quiz isOpen={isQuizModalOpen} closeModal={closeModal} />
              
            </></PageWrapper>
          }
        />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><AccountSettings /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
        <Route path="/404" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
        <Route path="/auth/callback" element={<AuthCallback />} />{" "}
        <Route path="/search" element={<PageWrapper><SearchResults /></PageWrapper>} />
        <Route path="/terms-of-service" element={<PageWrapper><TermsAndConditionsPage /></PageWrapper>} />
        <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
        <Route path="/blog/:slug" element={<PageWrapper><BlogPostPage /></PageWrapper>} />
      </Routes>
      </AnimatePresence>
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
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </UserProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
};

export default App;
