import React, { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { loginWithAuth0Token } from "../../util/authUtils";

const AUTH0_SCOPE = "openid profile email";

const AuthCallback: React.FC = () => {
  const {
    isAuthenticated,
    user: auth0User,
    getAccessTokenSilently,
    isLoading: auth0IsLoading,
  } = useAuth0();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setUser } = useUserContext();
  const navigate = useNavigate();

  // Prevent duplicate runs (e.g., React StrictMode in dev)
  const didRunRef = useRef(false);
  // Avoid setState after unmount/navigate
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      // Wait for Auth0 SDK to finish determining auth state
      if (auth0IsLoading) return;

      // If we have no authenticated user, stop loading and allow user to retry
      if (!isAuthenticated || !auth0User) {
        if (isMountedRef.current) {
          setIsLoading(false);
          setError("Authentication was not completed. Please try logging in again.");
        }
        return;
      }

      // Ensure we only run once per mount
      if (didRunRef.current) return;
      didRunRef.current = true;

      try {
        const cachedToken = sessionStorage.getItem("ax_id_token");

        const tokenResponse = cachedToken
          ? null
          : await getAccessTokenSilently({
              authorizationParams: {
                audience: process.env.REACT_APP_AUTH0_AUDIENCE,
                scope: AUTH0_SCOPE,
              },
              detailedResponse: true,
            });

        // When detailedResponse is true, Auth0 returns an object that includes id_token
        const idToken = cachedToken || (tokenResponse as any)?.id_token;

        if (!idToken) {
          throw new Error("Missing id_token from Auth0 token response.");
        }

        sessionStorage.setItem("ax_id_token", idToken);

        // This function likely navigates on success; keep it as the single source of truth
        await loginWithAuth0Token({ token: idToken, setUser, navigate });

        if (isMountedRef.current) setIsLoading(false);
      } catch (err: unknown) {
        console.error("Error during Auth0 callback:", err);
        if (isMountedRef.current) {
          setError("Authentication failed. Please try logging in again.");
          setIsLoading(false);
        }
      }
    };

    handleAuth();
  }, [
    auth0IsLoading,
    isAuthenticated,
    auth0User,
    getAccessTokenSilently,
    setUser,
    navigate,
  ]);

  if (isLoading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <h2>Authenticating...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error-screen" role="alert">
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
