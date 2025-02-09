import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../components/UserContext";
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
  const { user, setUser, isSessionChecked } = useUserContext();

  useEffect(() => {
    if (!isSessionChecked) return; // ✅ Prevents premature redirects

    if (!user) {
      console.warn("⚠️ No valid session. Redirecting to /auth...");
      navigate("/auth", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.warn("⚠️ No valid session. Redirecting to /auth...");
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        navigate("/auth", { replace: true });
      }
    };

    fetchProfile();
  }, [user, isSessionChecked, navigate, setUser]);

  if (!isSessionChecked) {
    return <div className="profile-loading">Checking session...</div>;
  }

  if (!profile) return <div className="profile-loading">No profile data found.</div>;

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; HttpOnly; SameSite=None";

      setUser(null);
      console.log("🔹 User successfully logged out.");
      navigate("/", { replace: true });
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Error during logout:", error);
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
          <h1 className="profile-name">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="profile-bio">{profile.bio}</p>
          <div>
            <button onClick={handleSignOut} className="profile-cta-button">
              Sign Out
            </button>
            <button onClick={() => navigate("/settings")} className="profile-cta-button">
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
              <div key={index} className="badge-item">
                {badge}
              </div>
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
              <div key={index} className="sport-item">
                {sport}
              </div>
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
              <div key={index} className="saved-item">
                {blog}
              </div>
            ))
          ) : (
            <p>No saved blogs yet.</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-subsection-header-text">Saved Products</h2>
        <div className="profile-saved-products">
          {/* {profile.savedProducts?.length ? (
            profile.savedProducts.map((product, index) => (
              <div key={index} className="saved-product-card">
                <img src={product} alt="Saved Product" className="saved-product-image" />
                <h3>{product}</h3>
              </div>
            ))
          ) : (
            <p>No saved products yet.</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
