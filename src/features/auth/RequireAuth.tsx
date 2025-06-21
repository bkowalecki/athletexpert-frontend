import React from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSessionChecked } = useUserContext();

  if (!isSessionChecked) return <div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default RequireAuth;