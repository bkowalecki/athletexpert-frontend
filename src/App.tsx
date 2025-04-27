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

import { Helmet } from "react-helmet";
import Header from "./features/layout/Header";
import HeroSection from "./features/layout/HeroSection";
import FeaturedProductList from "./features/products/FeaturedProductList";
import TrendingProductList from "./features/products/TrendingProductList";
import BlogSection from "./features/blog/BlogSection";
import Quiz from "./features/recommender/Quiz";
import ProfilePage from "./features/profile/ProfilePage";
import AboutPage from "./components/AboutPage";
import NotFoundPage from "./components/four0fourPage";
import TermsAndConditionsPage from "./features/legal/TermsAndConditions";
import BlogPage from "./features/blog/BlogPage";
import CommunityPage from "./features/community/CommunityPage";
import SportPage from "./features/community/SportPage";
import SearchResults from "./features/search/SearchResults";
import Footer from "./features/layout/Footer";
import BlogPostPage from "./features/blog/BlogPostPage";
import AuthPage from "./features/auth/AuthPage";
import OnboardingPage from "./features/profile/OnboardingPage";
import PrivacyPolicy from "./features/legal/PrivacyPolicy";
import ProductDetail from "./features/products/ProductDetail";
import AuthCallback from "./features/auth/AuthCallback";
import { UserProvider, useUserContext } from "./context/UserContext"; 
import { Auth0Provider } from "@auth0/auth0-react";
import AccountSettings from "./features/profile/AccountSettings";
import { Navigate } from "react-router-dom";
import { SportsProvider } from "./context/SportsContext";
import ScrollToTop from "./util/ScrollToTop";
import RequireAuth from "./features/auth/RequireAuth"; // ✅ Import RequireAuth
import ErrorBoundary from "./components/common/ErrorBoundary"; // ⭐ Add this import
import ProductsPage from "./features/products/ProductsPage";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const openModal = () => setQuizModalOpen(true);
  const closeModal = () => setQuizModalOpen(false);
  // const location = useLocation();
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
      <SportsProvider>
      <ToastContainer position="top-center" autoClose={3000} />
      <Header />
      <AnimatePresence mode="wait">
      <ErrorBoundary>
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
          <Route path="/profile" element={<RequireAuth><PageWrapper><ProfilePage /></PageWrapper></RequireAuth>} />
          <Route path="/settings" element={<PageWrapper><AccountSettings /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
          <Route path="/products/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
          <Route path="/404" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          <Route path="/community" element={<PageWrapper><CommunityPage /></PageWrapper>} />
          <Route path="/community/:sport" element={<SportPage />} /> {/* ✅ Add this */}
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/account-setup" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/search" element={<PageWrapper><SearchResults /></PageWrapper>} />
          <Route path="/terms-of-service" element={<PageWrapper><TermsAndConditionsPage /></PageWrapper>} />
          <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
          <Route path="/blog/:slug" element={<PageWrapper><BlogPostPage /></PageWrapper>} />
        </Routes>
        </ErrorBoundary>
      </AnimatePresence>
      <Footer />
      </SportsProvider>
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
