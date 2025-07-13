import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { loginWithAuth0Token } from "../../util/authUtils";

const AuthCallback: React.FC = () => {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (!isAuthenticated || !auth0User) return;

      try {
        const cachedToken = sessionStorage.getItem("ax_id_token");
        const idToken = cachedToken || (
          await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
            detailedResponse: true,
          })
        ).id_token;
      
        sessionStorage.setItem("ax_id_token", idToken);
        await loginWithAuth0Token({ token: idToken, setUser, navigate });
      } catch (err) {
        console.error("Error during Auth0 callback:", err);
        setError("Authentication failed. Please try logging in again.");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <h2>Authenticating...</h2>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="auth-error-screen">
        <h2>{error}</h2>
        <button onClick={() => navigate("/auth")} style={{ marginTop: 16 }}>
          Back to Login
        </button>
      </div>
    );
  }
  
  return null;
};

export default AuthCallback;
