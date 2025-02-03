import React, { useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const AuthCallback: React.FC = () => {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ Ensure the UserContext is available
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { setUser } = userContext;

  useEffect(() => {
    const handleAuth = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const auth0Token = await getAccessTokenSilently();
  
          // ✅ Send the Auth0 token to your backend
          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/auth0-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token: auth0Token }),
          });
  
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            navigate("/profile");
          } else {
            console.error("Failed to authenticate with backend:", response.status);
          }
        } catch (error) {
          console.error("Error during Auth0 callback:", error);
        }
      }
    };
  
    handleAuth();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);
  

  return <div>Loading...</div>; // ✅ Simple loading indicator
};

export default AuthCallback;
