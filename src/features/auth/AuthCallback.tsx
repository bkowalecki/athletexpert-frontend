import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const AuthCallback: React.FC = () => {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const idToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
            detailedResponse: true,
          });

          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/auth0-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: idToken.id_token }),
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({ ...userData, authProvider: 'auth0' }); // ⭐️ Make sure to add authProvider here
            navigate("/profile", { replace: true });
          } else {
            console.error("❌ Failed to authenticate with backend:", response.status);
            navigate("/auth", { replace: true });
          }
        } catch (error) {
          console.error("❌ Error during Auth0 callback:", error);
          navigate("/auth", { replace: true });
        }
      }
    };

    handleAuth();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h2>Authenticating...</h2>
    </div>
  );
};

export default AuthCallback;
