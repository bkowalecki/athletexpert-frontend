import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isSessionChecked } = useUserContext();
  const location = useLocation();

  // Still checking session → block rendering
  if (!isSessionChecked) {
    return (
      <div
        className="auth-loading-screen"
        role="status"
        aria-live="polite"
      >
        <p>Checking session...</p>
      </div>
    );
  }

  // Not authenticated → redirect to auth page
  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated → allow access
  return <>{children}</>;
};

export default RequireAuth;
