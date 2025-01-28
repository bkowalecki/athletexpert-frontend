import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/profile`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Include authentication cookies
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile.");

        const data = await response.json();
        console.log("Fetched Profile:", data);

        setProfile({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio || "No bio provided.",
          profilePictureUrl: data.profilePictureUrl || null,
          sports: data.sports ?? [], // Ensure sports is always an array
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
    };

    fetchProfile();
  }, []);

  if (error) return <div className="profile-page-error">Error: {error}</div>;
  if (!profile) return <div className="profile-page-loading">Loading...</div>;

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
    window.location.reload();
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
