import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../../context/UserContext";
import "../../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const { setUser, user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();
  const {
    getAccessTokenSilently,
    isAuthenticated,
    loginWithRedirect,
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
  const [auth0Attempted, setAuth0Attempted] = useState(false);

  /** Only redirect **if session is checked AND user is logged in** */
  useEffect(() => {
    console.log("Session Checked:", isSessionChecked, "User:", user);

    if (isSessionChecked) {
      if (user && typeof user === "object" && "email" in user) {
        console.log("Redirecting to /profile");
        navigate("/profile", { replace: true });
      } else {
        console.log("No active session, staying on /auth");
      }
    }
  }, [isSessionChecked, user, navigate]);

  /** Handle Auth0 login only if needed */
  useEffect(() => {
    if (
      isSessionChecked &&
      isAuthenticated &&
      auth0User &&
      !user &&
      !auth0Attempted
    ) {
      handleSSO();
    }
  }, [isSessionChecked, isAuthenticated, auth0User, user, auth0Attempted]);

  /** Handles Auth0 SSO Login */
  const handleSSO = async () => {
    try {
      setAuth0Attempted(true);
      const accessToken = await getAccessTokenSilently();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/auth0-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const userData = await response.json();
        if (userData?.user) {
          setUser({ ...userData.user, authProvider: "auth0" });

          navigate("/profile", { replace: true });
        } else {
          setError("Login successful, but no user data received.");
        }
      } else {
        console.error("Failed Auth0 backend login:", response.status);
      }
    } catch (error) {
      console.error("Error during Auth0 login:", error);
    }
  };

  /** Handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** ✅ Handles manual email/password login */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // ✅ Check confirmPassword match before sending anything
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

    try {
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
        const data = await response.json().catch(() => null);
        setError(data?.message || "An error occurred. Please try again.");
        return; // ✅ VERY IMPORTANT: if register fails, STOP here
      }

      const userData = await response.json();
      setUser({ ...userData.user, authProvider: "local" });

      // ✅ Only navigate to onboarding AFTER successful user creation
      navigate("/account-setup", { replace: true });
    } catch (error) {
      console.error("Error during authentication:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Prevent flashing of login page before session check */
  if (!isSessionChecked) {
    return <div className="auth-loading">Checking session...</div>;
  }

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
          className="google-login-btn"
          onClick={async () => {
            try {
              await loginWithPopup({
                authorizationParams: {
                  audience: "https://athletexpert-api",
                  scope: "openid profile email",
                  connection: "google-oauth2", // ✅ Force direct Google login
                },
              });

              const idTokenClaims = await getIdTokenClaims();
              if (!idTokenClaims) {
                console.error("No ID Token claims received.");
                return;
              }

              const idToken = idTokenClaims.__raw;

              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/users/auth0-login`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ token: idToken }),
                }
              );

              if (response.ok) {
                const userData = await response.json();
                setUser({ ...userData, authProvider: "auth0" });
                navigate("/profile");
              } else {
                console.error("Backend auth failed after SSO.");
                navigate("/auth");
              }
            } catch (error) {
              console.error("Error during Google SSO Popup:", error);
              navigate("/auth");
            }
          }}
          disabled={isSubmitting}
        >
          Sign in with Google
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
