import React, { Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useUserContext } from "./context/UserContext";
import RequireAuth from "./features/auth/RequireAuth";

// ✅ Lazy imports must come after top-level imports for ESLint compliance
const HeroSection = React.lazy(() => import("./features/layout/HeroSection"));
const FeaturedProductList = React.lazy(() => import("./features/products/FeaturedProductList"));
const TrendingProductList = React.lazy(() => import("./features/products/TrendingProductList"));
const BlogSection = React.lazy(() => import("./features/blog/BlogSection"));
const Quiz = React.lazy(() => import("./features/recommender/Quiz"));

const BlogPage = React.lazy(() => import("./features/blog/BlogPage"));
const BlogPostPage = React.lazy(() => import("./features/blog/BlogPostPage"));
const NewBlogPost = React.lazy(() => import("./features/blog/NewBlogPost"));

const ProductsPage = React.lazy(() => import("./features/products/ProductsPage"));
const ProductDetail = React.lazy(() => import("./features/products/ProductDetail"));
const AdminProductManager = React.lazy(() => import("./features/products/AdminProductManager"));

const ProfilePage = React.lazy(() => import("./features/profile/ProfilePage"));
const AccountSettings = React.lazy(() => import("./features/profile/AccountSettings"));
const OnboardingPage = React.lazy(() => import("./features/profile/OnboardingPage"));

const AboutPage = React.lazy(() => import("./components/AboutPage"));
const ContactPage = React.lazy(() => import("./features/legal/ContactPage"));
const TermsAndConditionsPage = React.lazy(() => import("./features/legal/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./features/legal/PrivacyPolicy"));

const CommunityPage = React.lazy(() => import("./features/community/CommunityPage"));
const SportPage = React.lazy(() => import("./features/community/SportPage"));

const SearchResults = React.lazy(() => import("./features/search/SearchResults"));
const AuthPage = React.lazy(() => import("./features/auth/AuthPage"));
const AuthCallback = React.lazy(() => import("./features/auth/AuthCallback"));

const NotFoundPage = React.lazy(() => import("./components/four0fourPage"));

const AppRoutes: React.FC = () => {
  const { isSessionChecked } = useUserContext();
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  if (!isSessionChecked) return <div className="loading-screen" />;

  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <Routes>
        {/* Home */}
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
              {isQuizModalOpen && (
                <Quiz isOpen={isQuizModalOpen} closeModal={() => setQuizModalOpen(false)} />
              )}
            </>
          }
        />

        {/* User */}
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/account-setup" element={<OnboardingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/admin/products" element={<RequireAuth><AdminProductManager /></RequireAuth>} />

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

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
