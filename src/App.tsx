import React, { useState } from "react";
import "./styles/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import Community from "./components/Community";
import SportPage from "./components/SportPage";
import SearchResults from "./components/SearchResults";
import Footer from "./components/Footer";
import BlogPostPage from "./components/BlogPostPage";
import AuthPage from "./components/AuthPage";
import OnboardingPage from "./components/OnboardingPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import AuthCallback from "./components/AuthCallback";
import { UserProvider, useUserContext } from "./components/UserContext"; 
import { Auth0Provider } from "@auth0/auth0-react";
import AccountSettings from "./components/AccountSettings";
import { Navigate } from "react-router-dom";

import ScrollToTop from "./util/ScrollToTop";
import ProductsPage from "./components/ProductsPage";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);
  const location = useLocation();
  const { isSessionChecked } = useUserContext(); // Ensures session is verified before rendering

  if (!isSessionChecked) {
    return <div className="loading-screen">Checking session...</div>; // Prevents UI flicker
  }

  const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isSessionChecked } = useUserContext();

    if (!isSessionChecked) {
        return <div>Checking session...</div>;
    }

    // Redirect if onboarding is complete
    if (user && user.firstName) {
        return <Navigate to="/profile" replace />;
    }

    return <>{children}</>;
};

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

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={3000} />
      <Header />
      <AnimatePresence mode="wait">
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
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><AccountSettings /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
          <Route path="/404" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/community" element={<PageWrapper><Community /></PageWrapper>} />
          <Route path="/community/:sport" element={<SportPage />} /> {/* ✅ Add this */}
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/account-setup" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
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
        <UserProvider> {/* ✅ Wraps entire app to ensure UserContext is available */}
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
