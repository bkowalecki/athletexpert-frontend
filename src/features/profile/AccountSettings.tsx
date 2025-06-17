import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useUserContext } from "../../context/UserContext";
import sportsList from "../../data/sports.json";
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
  const allowedSports = sportsList.map((s) => s.title);

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
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, profilePictureUrl: reader.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSportChange = (action: "add" | "remove", sport: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: action === "add" ? [...prev.sports, sport] : prev.sports.filter((s) => s !== sport),
    }));
    if (action === "add") setNewSport("");
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
      <Helmet>
        <title>Account Settings | AthleteXpert</title>
      </Helmet>
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

        {["username", "firstName", "lastName"].map((field) => (
          <div key={field} className="account-settings-section">
            <label>{field.replace(/^\w/, (c) => c.toUpperCase())}</label>
            <input
              type="text"
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              required={field === "username"}
            />
          </div>
        ))}

        <div className="account-settings-section">
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength={200} />
        </div>

        <div className="account-settings-section">
          <label>Sports</label>
          <div className="account-settings-sports">
            {formData.sports.map((sport) => (
              <span key={sport} className="account-settings-sport-tag">
                {sport}
                <button type="button" onClick={() => handleSportChange("remove", sport)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="account-settings-sport-picker">
            <select value={newSport} onChange={(e) => setNewSport(e.target.value)}>
              <option value="">-- Select a sport --</option>
              {allowedSports
                .filter((sport) => !formData.sports.includes(sport))
                .map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
            </select>
            <button type="button" onClick={() => handleSportChange("add", newSport)} disabled={!newSport}>
              Add Sport
            </button>
          </div>
        </div>

        <button type="submit" className="account-settings-save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;