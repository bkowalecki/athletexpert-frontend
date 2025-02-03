import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../context/UserContext";
import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const { setUser } = useContext(UserContext)!;
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, user: auth0User } = useAuth0();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSSO = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const accessToken = await getAccessTokenSilently();
          console.log("Access Token:", accessToken);

          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/auth0-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: accessToken }),
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            navigate("/profile");
          } else {
            console.error("Failed to authenticate with backend:", response.status);
          }
        } catch (error) {
          console.error("Error during Auth0 login:", error);
        }
      }
    };

    handleSSO();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
  
      const data = await response.json();
      if (response.ok) {
        setUser(data); // ✅ Set user context immediately
        navigate("/profile"); // ✅ Redirect to profile page
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration/login:", error);
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
  
        <button
          className="google-login-btn"
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                connection: "google-oauth2",
                scope: "openid profile email",
                response_type: "id_token",
              },
            })
          }
        >
          Sign in with Google
        </button>
  
        <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register here" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;