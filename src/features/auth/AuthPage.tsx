import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { loginWithAuth0Token } from "../../util/authUtils";
import { trackEvent } from "../../util/analytics";
import { toast } from "react-toastify";
import { loginUser, registerUser } from "../../api/user";
import "../../styles/AuthPage.css";

const AUTH0_SCOPE = "openid profile email";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user, isSessionChecked } = useUserContext();

  const {
    isAuthenticated,
    loginWithPopup,
    getIdTokenClaims,
    user: auth0User,
    isLoading: auth0IsLoading,
  } = useAuth0();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loggedOut = useRef(false);

  // Prevent repeated background SSO attempts
  const hasAttemptedSSO = useRef(false);

  // If session already exists, bounce to profile
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    loggedOut.current = params.get("loggedOut") === "1";
    if (isSessionChecked && user && !loggedOut.current) {
      navigate("/profile", { replace: true });
    }
  }, [isSessionChecked, user, navigate, location.search]);

  // If Auth0 is already authenticated (e.g. returning user) but our backend session/user isn't set, attempt SSO once.
  useEffect(() => {
    if (auth0IsLoading) return;

    if (
      isSessionChecked &&
      isAuthenticated &&
      auth0User &&
      !user &&
      !loggedOut.current &&
      !hasAttemptedSSO.current
    ) {
      hasAttemptedSSO.current = true;
      handleSSO();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0IsLoading, isSessionChecked, isAuthenticated, auth0User, user]);

  // Session expired message from backend/interceptor
  useEffect(() => {
    const expired = sessionStorage.getItem("sessionExpired");
    if (expired) {
      toast.warning("Your session expired. Please log in again.");
      sessionStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleSSO = async () => {
    try {
      // Use ID token (consistent with AuthCallback + Google SSO)
      const idToken = (await getIdTokenClaims())?.__raw;
      if (!idToken) throw new Error("No ID Token claims received.");

      await loginWithAuth0Token({ token: idToken, setUser, navigate });
    } catch (err) {
      console.error("Error during Auth0 SSO:", err);
      // Don’t hard error the page; user can still log in manually
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const email = formData.email.trim();
    const username = formData.username.trim();
    const password = formData.password;

    if (!email) {
      setError("Email is required.");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError("Username is required.");
        setIsSubmitting(false);
        return;
      }
      if (password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let userData: any;

      if (isLogin) {
        userData = await loginUser({ email, password });
        trackEvent("login", { method: "email" });
        navigate("/profile", { replace: true });
      } else {
        userData = await registerUser({ username, email, password });
        trackEvent("sign_up", { method: "register" });

        navigate(userData?.isActive ? "/profile" : "/account-setup", {
          replace: true,
        });
      }

      setUser(userData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithPopup({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: AUTH0_SCOPE,
          connection: "google-oauth2",
        },
      });

      const idToken = (await getIdTokenClaims())?.__raw;
      if (!idToken) throw new Error("No ID Token claims received.");

      trackEvent("login", { method: "google" });
      trackEvent("sign_up", { method: "google" });

      await loginWithAuth0Token({ token: idToken, setUser, navigate });
    } catch (err) {
      console.error("Google SSO Error:", err);
      navigate("/auth");
    }
  };

  if (!isSessionChecked) return <div className="auth-loading" />;

  return (
    <div className="auth-page-wrapper ax-page">
      <div className="auth-container">
        <h2>{isLogin ? "Welcome Back!" : "Create an Account"}</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              className="input-fields"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          )}

          <input
            type="email"
            name="email"
            className="input-fields"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <input
            type="password"
            name="password"
            className="input-fields"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              className="input-fields"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          className="google-login-btn gsi-material-button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          aria-label="Sign in with Google"
          type="button"
        >
          <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="google-icon"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
            </div>
            <span className="gsi-material-button-contents">Sign in with Google</span>
          </div>
        </button>

        <p className="toggle-auth">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <span className="toggle-auth-link" onClick={() => setIsLogin(false)}>
                Register here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="toggle-auth-link" onClick={() => setIsLogin(true)}>
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
