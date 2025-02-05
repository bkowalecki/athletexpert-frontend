import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../context/UserContext";
import "../styles/ProfilePage.css";

interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: string[] | null;
  badges?: string[];
  savedBlogs?: string[];
  savedProducts?: string[];
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userContext = useContext(UserContext);


const { logout, user: auth0User } = useAuth0();

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { setUser } = userContext;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Unauthorized");
        const data = await response.json();
        setProfile(data);
      } catch {
        setUser(null);
        navigate("/auth");
      }
    };

    fetchProfile();
  }, [navigate, setUser]);

  if (error) return <div className="profile-error">Error: {error}</div>;
  if (!profile) return <div className="profile-loading">Loading...</div>;

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
  
      document.cookie = "authToken=; Max-Age=0; path=/; SameSite=None; Secure";
      setUser(null);
  
      // ✅ Check if the user exists and logged in via Google SSO
      if (auth0User && auth0User.sub?.startsWith("google-oauth2|")) {
        // ✅ Log out from Auth0 and Google session
        logout({
          logoutParams: {
            returnTo: "https://athletexpert.vercel.app",
          },
        });
      } else {
        // ✅ Just refresh for email/password users
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  
  
  
  


  return (
    <div className="profile-container">
      <div className="profile-banner">
        <div className="profile-image-wrapper">
          <img
            src={profile.profilePictureUrl || "https://via.placeholder.com/150"}
            alt={profile.name}
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
          <p className="profile-bio">{profile.bio}</p>
          <div>
          <button onClick={handleSignOut} className="profile-cta-button">
        Sign Out
      </button>
      <button onClick={handleSignOut} className="profile-cta-button">
        Settings
      </button>
      </div>
        </div>
        
      </div>

      <hr className="profile-divider" />

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Badges</h2>
        <div className="profile-badges">
          {profile.badges?.length ? (
            profile.badges.map((badge, index) => (
              <div key={index} className="badge-item">{badge}</div>
            ))
          ) : (
            <p>No badges yet. Start achieving!</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Sports & Stats</h2>
        <div className="profile-sports">
          {profile.sports?.length ? (
            profile.sports.map((sport, index) => (
              <div key={index} className="sport-item">{sport}</div>
            ))
          ) : (
            <p>No sports added yet.</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Saved Blogs</h2>
        <div className="profile-saved-blogs">
          {profile.savedBlogs?.length ? (
            profile.savedBlogs.map((blog, index) => (
              <div key={index} className="saved-item">{blog}</div>
            ))
          ) : (
            <p>No saved blogs yet.</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Saved Products</h2>
        <div className="profile-saved-products">
          {profile.savedProducts?.length ? (
            profile.savedProducts.map((product, index) => (
              <div key={index} className="saved-item">{product}</div>
            ))
          ) : (
            <p>No saved products yet.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
