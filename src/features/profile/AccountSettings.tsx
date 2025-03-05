import React, { useEffect, useState, useContext } from "react";
import { useUserContext } from "../../context/UserContext";
import "../../styles/AccountSettings.css";

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl: string;
  sports: string[];
}

const AccountSettings: React.FC = () => {
  const { user, setUser } = useUserContext(); 
  const [formData, setFormData] = useState<UserProfile>({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    profilePictureUrl: "",
    sports: [],
  });
  const [newSport, setNewSport] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        profilePictureUrl: user.profilePictureUrl || "",
        sports: user.sports || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSport = () => {
    if (newSport && !formData.sports.includes(newSport)) {
      setFormData((prev) => ({ ...prev, sports: [...prev.sports, newSport] }));
      setNewSport("");
    }
  };

  const handleRemoveSport = (sport: string) => {
    setFormData((prev) => ({ ...prev, sports: prev.sports.filter((s) => s !== sport) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="account-settings-container">
      <h2>Account Settings</h2>
      {message && <div className="account-settings-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="account-settings-section">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {formData.profilePictureUrl && (
            <img src={formData.profilePictureUrl} alt="Profile" className="account-settings-avatar" />
          )}
        </div>

        <div className="account-settings-section">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="account-settings-section">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="account-settings-section">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="account-settings-section">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={200}
          />
        </div>

        <div className="account-settings-section">
          <label>Sports</label>
          <div className="account-settings-sports">
            {formData.sports.map((sport, index) => (
              <span key={index} className="account-settings-sport-tag">
                {sport}
                <button type="button" onClick={() => handleRemoveSport(sport)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={newSport}
            onChange={(e) => setNewSport(e.target.value)}
            placeholder="Add a sport"
          />
          <button type="button" onClick={handleAddSport}>
            Add Sport
          </button>
        </div>

        <button type="submit" className="account-settings-save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;
