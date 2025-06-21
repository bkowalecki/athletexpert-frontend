import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles/App.css";

import Header from "./features/layout/Header";
import Footer from "./features/layout/Footer";
import PwaNav from "./features/layout/PwaNav";
import ScrollToTop from "./util/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";

import { Auth0Provider } from "@auth0/auth0-react";
import { UserProvider } from "./context/UserContext";
import { SportsProvider } from "./context/SportsContext";

import AppRoutes from "./AppRoutes";
import useIsMobilePWA from "./hooks/useIsMobilePWA";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const isMobilePWA = useIsMobilePWA();

  return (
    <div className="App">
      <SportsProvider>
        <ToastContainer position="top-center" autoClose={3000} />
        <Header />
        <AnimatePresence mode="wait">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AnimatePresence>
        {isMobilePWA && <PwaNav />}
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
