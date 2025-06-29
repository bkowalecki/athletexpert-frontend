import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
// Custom styles for Toast are imported via your global styles
import "./styles/App.css";

import Header from "./features/layout/Header";
import ScrollToTop from "./util/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Auth0Provider } from "@auth0/auth0-react";
import { UserProvider } from "./context/UserContext";
import { SportsProvider } from "./context/SportsContext";
import AppRoutes from "./AppRoutes";
import useIsMobilePWA from "./hooks/useIsMobilePWA";

// Lazy load below-the-fold components
const Footer = React.lazy(() => import("./features/layout/Footer"));
const PwaNav = React.lazy(() => import("./features/layout/PwaNav"));

const queryClient = new QueryClient();

const AppContent: React.FC = React.memo(() => {
  const isMobilePWA = useIsMobilePWA();

  return (
    <div className="App">
      <SportsProvider>
        <Header />
        {/* <ScrollToTop /> Optional, but nice for UX */}
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="app-loading">Loading...</div>}>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </Suspense>
        </AnimatePresence>
        {isMobilePWA && (
          <Suspense fallback={null}>
            <PwaNav />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </SportsProvider>
    </div>
  );
});

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
          <ScrollToTop /> 
          <AppContent />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  </Auth0Provider>
);

export default App;
