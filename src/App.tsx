import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import Header from "./features/layout/Header";
import Footer from "./features/layout/Footer";
import PwaNav from "./features/layout/PwaNav";
import ScrollToTop from "./util/ScrollToTop";
import { UserProvider, useUserContext } from "./context/UserContext";
import { SportsProvider } from "./context/SportsContext";
import { Auth0Provider } from "@auth0/auth0-react";
import RequireAuth from "./features/auth/RequireAuth";
import ErrorBoundary from "./components/common/ErrorBoundary";

const HeroSection = lazy(() => import("./features/layout/HeroSection"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const NotFoundPage = lazy(() => import("./components/four0fourPage"));
const TermsAndConditionsPage = lazy(() => import("./features/legal/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./features/legal/PrivacyPolicy"));
const ContactPage = lazy(() => import("./features/legal/ContactPage"));
const SearchResults = lazy(() => import("./features/search/SearchResults"));
const BlogPage = lazy(() => import("./features/blog/BlogPage"));
const BlogPostPage = lazy(() => import("./features/blog/BlogPostPage"));
const NewBlogPost = lazy(() => import("./features/blog/NewBlogPost"));
const CommunityPage = lazy(() => import("./features/community/CommunityPage"));
const SportPage = lazy(() => import("./features/community/SportPage"));
const ProductsPage = lazy(() => import("./features/products/ProductsPage"));
const ProductDetail = lazy(() => import("./features/products/ProductDetail"));
const AdminProductManager = lazy(() => import("./features/products/AdminProductManager"));
const AuthPage = lazy(() => import("./features/auth/AuthPage"));
const AuthCallback = lazy(() => import("./features/auth/AuthCallback"));
const OnboardingPage = lazy(() => import("./features/profile/OnboardingPage"));
const ProfilePage = lazy(() => import("./features/profile/ProfilePage"));
const AccountSettings = lazy(() => import("./features/profile/AccountSettings"));
const FeaturedProductList = lazy(() => import("./features/products/FeaturedProductList"));
const TrendingProductList = lazy(() => import("./features/products/TrendingProductList"));
const BlogSection = lazy(() => import("./features/blog/BlogSection"));
const Quiz = lazy(() => import("./features/recommender/Quiz"));

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { isSessionChecked } = useUserContext();
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  if (!isSessionChecked) return <div className="loading-screen"></div>;

  return (
    <div className="App">
      <SportsProvider>
        <ToastContainer position="top-center" autoClose={3000} />
        <Header />
        <AnimatePresence mode="wait">
          <ErrorBoundary>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <HeroSection openQuiz={() => setQuizModalOpen(true)} />
                      <main>
                        <FeaturedProductList />
                        <TrendingProductList />
                        <BlogSection />
                      </main>
                      {isQuizModalOpen && <Quiz isOpen={isQuizModalOpen} closeModal={() => setQuizModalOpen(false)} />}
                    </>
                  }
                />
                <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="/settings" element={<AccountSettings />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/admin/new-blog" element={<NewBlogPost />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/admin/products" element={<RequireAuth><AdminProductManager /></RequireAuth>} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:sport" element={<SportPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account-setup" element={<OnboardingPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AnimatePresence>
        {isStandalone && isMobile && <PwaNav />}
        <Footer />
      </SportsProvider>
    </div>
  );
};

const App: React.FC = () => (
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN ?? ""}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID ?? ""}
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

export default App;