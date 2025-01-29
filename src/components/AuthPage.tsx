import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../context/UserContext";
import type { User } from "../context/UserContext";
import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { setUser } = userContext;
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // **🔹 Persist Login Across Page Refresh**
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("authToken", token); // ✅ Save token for persistence

          const userData: User = {
            firstName: auth0User.given_name ?? "",
            lastName: auth0User.family_name ?? "",
            email: auth0User.email ?? "no-email@unknown.com",
            profilePictureUrl: auth0User.picture ?? "",
            username: auth0User.nickname ?? "Guest",
            bio: null,
            sports: [],
          };

          setUser(userData);
          navigate("/profile");
        } catch (error) {
          console.error("Error loading user:", error);
        }
      }
    };

    loadUser();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, setUser, navigate]);

  // **🔹 Handle Input Changes**
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // **🔹 Handle Manual Login/Signup**
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? "login" : "register";
    const requestBody = isLogin
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
          body: JSON.stringify(requestBody),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token); // ✅ Store token in localStorage
      
        const userData: User = {
          username: data.username ?? "Guest",
          email: data.email ?? "no-email@unknown.com",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          profilePictureUrl: data.profilePictureUrl ?? "",
          bio: data.bio ?? null,
          sports: data.sports ?? [],
        };
      
        setUser(userData);
        navigate("/profile");
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // **🔹 Handle Google Login**
  const handleGoogleLogin = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2", // ✅ Forces Google login directly
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          )}
          <button type="submit" className="submit-button">
            {isLogin ? "Login" : "Register"}
          </button>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" alt="Google Logo" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
