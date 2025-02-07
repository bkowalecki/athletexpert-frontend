import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../context/UserContext";
import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const { setUser } = useContext(UserContext)!;
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

  /** ✅ Automatically logs in Auth0 users */
  useEffect(() => {
    const handleSSO = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const accessToken = await getAccessTokenSilently();
          console.log("🔑 Access Token:", accessToken);

          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/users/auth0-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: accessToken }),
              credentials: "include", // ✅ Ensures cookies are sent
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            navigate("/profile");
          } else {
            console.error("❌ Failed Auth0 backend login:", response.status);
          }
        } catch (error) {
          console.error("❌ Error during Auth0 login:", error);
        }
      }
    };

    handleSSO();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  /** ✅ Handles input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password, origin: window.location.origin }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          origin: window.location.origin,
        };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // ✅ Ensures cookies are sent
      });
  
      if (!response.ok) {
        const data = await response.json().catch(() => null); // ✅ Prevent JSON parse error
        setError(data?.message || "An error occurred. Please try again.");
        return;
      }
  
      const userData = await response.json().catch(() => null); // ✅ Handle empty response
      if (!userData || !userData.user) {
        console.warn("⚠️ Empty response received from backend.");
        setError("Login successful, but no user data received.");
        return;
      }
  
      setUser(userData.user);
      navigate("/profile");
    } catch (error) {
      console.error("❌ Error during authentication:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };
  
  

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
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
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
