import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import { useNavigate } from 'react-router-dom';

interface Sport {
  name: string;
  stats: string;
}

interface Profile {
  name: string;
  bio: string | null;
  profilePictureUrl: string | null;
  sports: Sport[] | null; // Sports can be null or an empty array
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile.');
        }
        const data = await response.json();

        // Ensure profile contains default values for missing fields
        const profileData: Profile = {
          name: data.name,
          bio: data.bio || 'No bio provided.', // Default message for missing bio
          profilePictureUrl: data.profilePictureUrl || null,
          sports: data.sports ?? [], // Default to empty array if sports is null or undefined
        };

        setProfile(profileData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  const handleSignOut = () => {
    localStorage.removeItem('authToken'); // Remove token from storage
    navigate('/auth'); // Redirect to login/register page
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={profile.profilePictureUrl || "https://via.placeholder.com/150"}
          alt={profile.name}
          className="profile-picture"
        />
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-bio">{profile.bio}</p>
        </div>
      </div>
      <hr className="profile-divider" />
      <div className="profile-details">
        <h2 className="section-heading">Sports & Stats</h2>
        <div className="sport-list">
          {/* Ensure sports is always an array, even if it's empty */}
          {profile.sports && profile.sports.length > 0 ? (
            profile.sports.map((sport, index) => (
              <div key={index} className="sport-item">
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-stats">{sport.stats}</p>
              </div>
            ))
          ) : (
            <p>No sports added yet.</p>
          )}
        </div>
      </div>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default ProfilePage;
