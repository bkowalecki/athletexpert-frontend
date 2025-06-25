import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import { loginWithAuth0Token } from "../../util/authUtils";
import "../../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const { setUser, user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();
  const {
    getAccessTokenSilently,
    isAuthenticated,
    loginWithPopup,
    getIdTokenClaims,
    user: auth0User,
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
  const hasAttemptedSSO = useRef(false);

  useEffect(() => {
    if (isSessionChecked && user) navigate("/profile", { replace: true });
  }, [isSessionChecked, user, navigate]);

  useEffect(() => {
    if (
      isSessionChecked &&
      isAuthenticated &&
      auth0User &&
      !user &&
      !hasAttemptedSSO.current
      // window.location.pathname !== "/auth"
    ) {
      hasAttemptedSSO.current = true;
      handleSSO();
    }
  }, [isSessionChecked, isAuthenticated, auth0User, user]);

  const handleSSO = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      await loginWithAuth0Token({ token: accessToken, setUser, navigate });
    } catch (error) {
      console.error("Error during Auth0 login:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = isLogin ? "login" : "register";
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };

      if (!isLogin && formData.password !== formData.confirmPassword) {
        if (error !== "Passwords do not match.")
          setError("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "❌ Authentication failed");
      }

      const userData = await response.json();
      setUser(userData);

      if (isLogin) {
        navigate("/profile", { replace: true });
      } else {
        navigate(userData.isActive ? "/profile" : "/account-setup", {
          replace: true,
        });
      }
    } catch (err: any) {
      console.error("❌ Auth error:", err);
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithPopup({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: "openid profile email",
          connection: "google-oauth2",
        },
      });

      const idToken = (await getIdTokenClaims())?.__raw;
      if (!idToken) throw new Error("No ID Token claims received.");

      await loginWithAuth0Token({ token: idToken, setUser, navigate });
    } catch (error) {
      console.error("Error during Google SSO Popup:", error);
      navigate("/auth");
    }
  };

  if (!isSessionChecked) return <div className="auth-loading"></div>;

  return (
    <div className="auth-page-wrapper">
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
          />
          <input
            type="password"
            name="password"
            className="input-fields"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
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
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">
              Sign in with Google
            </span>
          </div>
        </button>

        <p className="toggle-auth">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                className="toggle-auth-link"
                onClick={() => setIsLogin(false)}
              >
                Register here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="toggle-auth-link"
                onClick={() => setIsLogin(true)}
              >
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
