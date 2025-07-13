import React, { Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useUserContext } from "./context/UserContext";
import RequireAuth from "./features/auth/RequireAuth";
import LoadingScreen from "./components/LoadingScreen";

// Instant-load components for homepage
import HeroSection from "./features/layout/HeroSection";
import FeaturedProductList from "./features/products/FeaturedProductList";
import TrendingProductList from "./features/products/TrendingProductList";
import BlogSection from "./features/blog/BlogSection";

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

// ===================== Route Groups =====================
const authRoutes = [
  { path: "/profile", element: <RequireAuth><ProfilePage /></RequireAuth> },
  { path: "/settings", element: <AccountSettings /> },
  { path: "/account-setup", element: <OnboardingPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
];

const productRoutes = [
  { path: "/products", element: <ProductsPage /> },
  // { path: "/products/:id", element: <ProductDetail /> },
  {path: "/products/:slug", element:<ProductDetail /> },
  { path: "/admin/products", element: <RequireAuth><AdminProductManager /></RequireAuth> },
];

const blogRoutes = [
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogPostPage /> },
  { path: "/admin/new-blog", element: <NewBlogPost /> },
];

const communityRoutes = [
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/:sport", element: <SportPage /> },
];

const miscRoutes = [
  { path: "/search", element: <SearchResults /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/terms-and-conditions", element: <TermsAndConditionsPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "*", element: <NotFoundPage /> },
];

// ===================== Quiz Modal Component =====================
const QuizModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Quiz isOpen={isOpen} closeModal={closeModal} />
    </Suspense>
  );
};

// ===================== AppRoutes Component =====================
const AppRoutes: React.FC = () => {
  const { isSessionChecked } = useUserContext();
  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  // Avoid auth flash: only show content after session check
  if (!isSessionChecked) return <LoadingScreen />;

  return (
    <main className="page-content">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <HeroSection openQuiz={() => setQuizModalOpen(true)} />
                <FeaturedProductList />
                <TrendingProductList />
                <BlogSection />
                <QuizModal
                  isOpen={isQuizModalOpen}
                  closeModal={() => setQuizModalOpen(false)}
                />
              </>
            }
          />

          {/* Auth Routes */}
          {authRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Product Routes */}
          {productRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Blog Routes */}
          {blogRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Community Routes */}
          {communityRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Miscellaneous Routes */}
          {miscRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </Suspense>
    </main>
  );
};

export default AppRoutes;