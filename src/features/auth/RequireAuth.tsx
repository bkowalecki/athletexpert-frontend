import React from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext"; // adjust path if needed

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isSessionChecked } = useUserContext();

  if (!isSessionChecked) {
    return <div>Checking session...</div>; // Optional: Replace with spinner if you want
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
