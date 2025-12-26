import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "./styles/App.css";

import Header from "./features/layout/Header";
import ScrollToTop from "./util/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Auth0Provider } from "@auth0/auth0-react";
import { UserProvider } from "./context/UserContext";
import { SportsProvider } from "./context/SportsContext";
import AppRoutes from "./AppRoutes";
import useIsMobilePWA from "./hooks/useIsMobilePWA";
import CookieConsentBanner from "./features/legal/CookieConsentBanner";

const Footer = React.lazy(() => import("./features/layout/Footer"));
const PwaNav = React.lazy(() => import("./features/layout/PwaNav"));

// Keep a single client instance for the entire app lifetime
const queryClient = new QueryClient();

// ===================== AppProviders Component =====================
const AppProviders: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN ?? "";
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID ?? "";

    // Dev-only hint; no runtime behavior change (still uses empty strings if missing)
    if (process.env.NODE_ENV !== "production") {
      if (!domain || !clientId) {
        // eslint-disable-next-line no-console
        console.warn(
          "[Auth0] Missing REACT_APP_AUTH0_DOMAIN or REACT_APP_AUTH0_CLIENT_ID. Auth may not work locally."
        );
      }
    }

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
              {children}
            </Router>
          </UserProvider>
        </QueryClientProvider>
      </Auth0Provider>
    );
  }
);
AppProviders.displayName = "AppProviders";

// ===================== AppContent Component =====================
const AppContent: React.FC = React.memo(() => {
  const isMobilePWA = useIsMobilePWA();

  return (
    <div className="App">
      <SportsProvider>
        <Header />

        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="app-loading">Loading...</div>}>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </Suspense>
        </AnimatePresence>

        <Suspense fallback={null}>
          {isMobilePWA && <PwaNav />}
          <Footer />
        </Suspense>

        <CookieConsentBanner />
      </SportsProvider>
    </div>
  );
});
AppContent.displayName = "AppContent";

// ===================== App Component =====================
const App: React.FC = () => (
  <AppProviders>
    <ToastContainer
      position="top-center"
      toastClassName="ax-toast"
      autoClose={1800}
      hideProgressBar
      pauseOnHover
      closeOnClick
      newestOnTop
      draggable={false}
    />
    <AppContent />
  </AppProviders>
);

export default App;
