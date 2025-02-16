import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserContext } from "../components/UserContext";
import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const { setUser, user, isSessionChecked } = useUserContext();
  const navigate = useNavigate();
  const {
    getAccessTokenSilently,
    isAuthenticated,
    loginWithRedirect,
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
          setUser(userData.user);
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
  
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
  
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message || "An error occurred. Please try again.");
        return;
      }
  
      const userData = await response.json();
      setUser(userData.user);
      navigate("/account-setup", { replace: true }); // 👈 Go to onboarding after registration
    } catch (error) {
      console.error("Error during authentication:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Prevent flashing of login page before session check */
  // if (!isSessionChecked) {
  //   return <div className="auth-loading">Checking session...</div>;
  // }

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

        {/* ✅ Google Login Button */}
        <button
          className="google-login-btn"
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                audience: "https://athletexpert-api",
                scope: "openid profile email",
                prompt: "consent",
              },
            })
          }
          disabled={isSubmitting}
        >
          Sign in with Google
        </button>

        <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Register here"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
