import React, { Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useUserContext } from "./context/UserContext";
import RequireAuth from "./features/auth/RequireAuth";

// Instant-load components for homepage
import HeroSection from "./features/layout/HeroSection";
import FeaturedProductList from "./features/products/FeaturedProductList";
import TrendingProductList from "./features/products/TrendingProductList";
import BlogSection from "./features/blog/BlogSection";
import LoadingScreen from "./components/LoadingScreen";

// Lazy-loaded routes
const Quiz = React.lazy(() => import("./features/recommender/Quiz"));
const ProductsPage = React.lazy(() => import("./features/products/ProductsPage"));
const ProductDetail = React.lazy(() => import("./features/products/ProductDetail"));
const AdminProductManager = React.lazy(() => import("./features/products/AdminProductManager"));
const BlogPage = React.lazy(() => import("./features/blog/BlogPage"));
const BlogPostPage = React.lazy(() => import("./features/blog/BlogPostPage"));
const NewBlogPost = React.lazy(() => import("./features/blog/NewBlogPost"));
const ProfilePage = React.lazy(() => import("./features/profile/ProfilePage"));
const AccountSettings = React.lazy(() => import("./features/profile/AccountSettings"));
const OnboardingPage = React.lazy(() => import("./features/profile/OnboardingPage"));
const CommunityPage = React.lazy(() => import("./features/community/CommunityPage"));
const SportPage = React.lazy(() => import("./features/community/SportPage"));
const SearchResults = React.lazy(() => import("./features/search/SearchResults"));
const AuthPage = React.lazy(() => import("./features/auth/AuthPage"));
const AuthCallback = React.lazy(() => import("./features/auth/AuthCallback"));
const AboutPage = React.lazy(() => import("./components/AboutPage"));
const ContactPage = React.lazy(() => import("./features/legal/ContactPage"));
const TermsAndConditionsPage = React.lazy(() => import("./features/legal/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./features/legal/PrivacyPolicy"));
const NotFoundPage = React.lazy(() => import("./components/four0fourPage"));

const AppRoutes: React.FC = () => {
  const { isSessionChecked } = useUserContext();
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  // Avoid auth flash: only show content after session check
  if (!isSessionChecked) return <LoadingScreen />;

  return (
    <main className="page-content">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Home: All above-the-fold content is critical path */}
          <Route
            path="/"
            element={
              <>
                <HeroSection openQuiz={() => setQuizModalOpen(true)} />
                <FeaturedProductList />
                <TrendingProductList />
                <BlogSection />
                {/* Modal Quiz, only mounted when open */}
                {isQuizModalOpen && (
                  <Quiz
                    isOpen={isQuizModalOpen}
                    closeModal={() => setQuizModalOpen(false)}
                  />
                )}
              </>
            }
          />
          {/* Auth / Account */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/account-setup" element={<OnboardingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Products */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/admin/products"
            element={
              <RequireAuth>
                <AdminProductManager />
              </RequireAuth>
            }
          />

          {/* Blog */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/admin/new-blog" element={<NewBlogPost />} />

          {/* Community */}
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:sport" element={<SportPage />} />

          {/* Misc */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </main>
  );
};

export default AppRoutes;
