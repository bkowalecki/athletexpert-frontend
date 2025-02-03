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
  sports: string[] | null; // Sports are an array of strings now
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth0(); // ✅ Get logout function from Auth0
  const userContext = useContext(UserContext);

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
        setUser(null); // ✅ Clear user context if unauthorized
        navigate("/auth"); // ✅ Redirect to login page
      }
    };
  
    fetchProfile();
  }, [navigate, setUser]);
  

  if (error) return <div className="profile-page-error">Error: {error}</div>;
  if (!profile) return <div className="profile-page-loading">Loading...</div>;

  // ✅ Fixed Logout Function
  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
  
      document.cookie = "authToken=; Max-Age=0; path=/;";
      setUser(null);
  
      logout({
        logoutParams: {
          returnTo: window.location.origin, // ✅ Redirect to the homepage
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  
  

  return (
    <div className="profile-page-container">
      {/* Profile Header */}
      <div className="profile-page-header">
        <div className="profile-page-image-wrapper">
          <img
            src={profile.profilePictureUrl || "https://via.placeholder.com/150"}
            alt={profile.name}
            className="profile-page-picture"
          />
        </div>
        <div className="profile-page-info">
          <h1 className="profile-page-name">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="profile-page-bio">{profile.bio}</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="profile-page-divider" />

      {/* Sports & Stats Section */}
      <div className="profile-page-details">
        <h2 className="profile-page-section-heading">🏆 Sports & Stats</h2>
        <div className="profile-page-sport-list">
          {profile.sports && profile.sports.length > 0 ? (
            profile.sports.map((sport, index) => (
              <div key={index} className="profile-page-sport-item">
                <h3 className="profile-page-sport-name">{String(sport)}</h3>
              </div>
            ))
          ) : (
            <p className="profile-page-no-sports">No sports added yet.</p>
          )}
        </div>
      </div>

      {/* Sign Out Button */}
      <button onClick={handleSignOut} className="profile-page-signout-button">
        Sign Out
      </button>
    </div>
  );
};

export default ProfilePage;
