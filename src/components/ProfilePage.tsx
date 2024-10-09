import React from "react";
import "../styles/ProfilePage.css";

interface Sport {
  name: string;
  stats: string;  // You can customize this for more detailed stats
}

interface Profile {
  name: string;
  profilePictureUrl: string;
  bio?: string;
  sports: Sport[];
}

const ProfilePage: React.FC = () => {
  // Sample data for the user
  const profile: Profile = {
    name: "John Doe",
    profilePictureUrl: "https://example.com/profile-picture.jpg",
    bio: "Professional athlete in multiple sports disciplines.",
    sports: [
      { name: "Basketball", stats: "Points: 20.3, Assists: 7.1, Rebounds: 9.2" },
      { name: "Soccer", stats: "Goals: 12, Assists: 8, Matches: 20" }
    ]
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={profile.profilePictureUrl}
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
          {profile.sports.map((sport, index) => (
            <div key={index} className="sport-item">
              <h3 className="sport-name">{sport.name}</h3>
              <p className="sport-stats">{sport.stats}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
