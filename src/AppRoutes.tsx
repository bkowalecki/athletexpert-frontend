import React, { Suspense, useCallback, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useUserContext } from "./context/UserContext";
import RequireAuth from "./features/auth/RequireAuth";
import LoadingScreen from "./components/LoadingScreen";

// Instant-load homepage sections
import HeroSection from "./features/layout/HeroSection";
import FeaturedProductList from "./features/products/FeaturedProductList";
import TrendingProductList from "./features/products/TrendingProductList";
import BlogSection from "./features/blog/BlogSection";

// Lazy-loaded routes
const Quiz = React.lazy(() => import("./features/recommender/Quiz"));
const ProductsPage = React.lazy(() => import("./features/products/ProductsPage"));
const ProductDetail = React.lazy(() => import("./features/products/ProductDetail"));
const AdminProductManager = React.lazy(
  () => import("./features/products/AdminProductManager")
);
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
const TermsAndConditionsPage = React.lazy(
  () => import("./features/legal/TermsAndConditions")
);
const PrivacyPolicy = React.lazy(() => import("./features/legal/PrivacyPolicy"));
const NotFoundPage = React.lazy(() => import("./components/four0fourPage"));

const SportForumPage = React.lazy(() => import("./features/community/forum/SportForumPage"));
const NewThreadPage = React.lazy(() => import("./features/community/forum/NewThreadPage"));
const ThreadDetailPage = React.lazy(() => import("./features/community/forum/ThreadDetailPage"));

type RouteDef = Readonly<{ path: string; element: React.ReactElement }>;

/* ===================== Quiz Modal ===================== */

const QuizModal: React.FC<{ isOpen: boolean; closeModal: () => void }> = React.memo(
  ({ isOpen, closeModal }) => {
    if (!isOpen) return null;

    return (
      <Suspense fallback={<LoadingScreen />}>
        <Quiz isOpen={isOpen} closeModal={closeModal} />
      </Suspense>
    );
  }
);
QuizModal.displayName = "QuizModal";

/* ===================== Home Route ===================== */

const HomeRoute: React.FC<{
  openQuiz: () => void;
  isQuizModalOpen: boolean;
  closeQuiz: () => void;
}> = React.memo(({ openQuiz, isQuizModalOpen, closeQuiz }) => {
  return (
    <>
      <HeroSection openQuiz={openQuiz} />
      <FeaturedProductList />
      <TrendingProductList />
      <BlogSection />
      <QuizModal isOpen={isQuizModalOpen} closeModal={closeQuiz} />
    </>
  );
});
HomeRoute.displayName = "HomeRoute";

/* ===================== Route Groups ===================== */

const authRoutes: RouteDef[] = [
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  { path: "/settings", element: <AccountSettings /> },
  { path: "/account-setup", element: <OnboardingPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
];

const productRoutes: RouteDef[] = [
  { path: "/products", element: <ProductsPage /> },
  { path: "/products/:slug", element: <ProductDetail /> },
  {
    path: "/admin/products",
    element: (
      <RequireAuth>
        <AdminProductManager />
      </RequireAuth>
    ),
  },
];

const blogRoutes: RouteDef[] = [
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogPostPage /> },
  { path: "/admin/new-blog", element: <NewBlogPost /> },
];

const communityRoutes: RouteDef[] = [
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/:sport/forum/new", element: <NewThreadPage /> },
  { path: "/community/:sport/forum/:threadId", element: <ThreadDetailPage /> },
  { path: "/community/:sport/forum", element: <SportForumPage /> },
  { path: "/community/:sport", element: <SportPage /> },
];

const miscRoutes: RouteDef[] = [
  { path: "/search", element: <SearchResults /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/terms-and-conditions", element: <TermsAndConditionsPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "*", element: <NotFoundPage /> },
];

/* ===================== AppRoutes ===================== */

const AppRoutes: React.FC = () => {
  const { isSessionChecked } = useUserContext();
  const location = useLocation();

  const [isQuizModalOpen, setQuizModalOpen] = useState(false);
  const openQuiz = useCallback(() => setQuizModalOpen(true), []);
  const closeQuiz = useCallback(() => setQuizModalOpen(false), []);

  return (
    <main className="page-content" id="main-content">
      {/* Keep main mounted to avoid footer jump during auth check */}
      {!isSessionChecked ? (
        <LoadingScreen />
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          {/* 🔑 FINAL FIX: force full remount on every navigation */}
          <Routes location={location}>
            <Route
              path="/"
              element={
                <HomeRoute
                  openQuiz={openQuiz}
                  isQuizModalOpen={isQuizModalOpen}
                  closeQuiz={closeQuiz}
                />
              }
            />

            {authRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            {productRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            {blogRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            {communityRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            {miscRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </Suspense>
      )}
    </main>
  );
};

export default AppRoutes;
