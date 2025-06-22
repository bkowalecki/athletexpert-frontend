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
  city?: string;
  state?: string;
  country?: string;
  gender?: string;
  dob?: string;
  favoriteColor?: string;
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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fieldLabels: Record<keyof UserProfile, string> = {
    username: "Username",
    firstName: "First Name",
    lastName: "Last Name",
    bio: "Bio",
    profilePictureUrl: "Profile Picture",
    sports: "Sports",
    city: "City",
    state: "State",
    country: "Country",
    gender: "Gender",
    dob: "Date of Birth",
    favoriteColor: "Favorite Color",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: reader.result as string,
        }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSportChange = (action: "add" | "remove", sport: string) => {
    setFormData((prev) => ({
      ...prev,
      sports:
        action === "add"
          ? [...prev.sports, sport]
          : prev.sports.filter((s) => s !== sport),
    }));
    if (action === "add") setNewSport("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Deleting your account is permanent.\nAll your saved products, blogs, and data will be removed.\n\nAre you sure?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/delete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setUser(null);
        setMessage("Your account has been deleted. Redirecting...");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      } else {
        setMessage("❌ Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
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
          <label>{fieldLabels.profilePictureUrl}</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {formData.profilePictureUrl && (
            <img
              src={formData.profilePictureUrl}
              alt="Profile"
              className="account-settings-avatar"
            />
          )}
        </div>

        {(["username", "firstName", "lastName"] as (keyof UserProfile)[]).map(
          (field) => (
            <div key={field} className="account-settings-section">
              <label>{fieldLabels[field]}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field === "username"}
              />
            </div>
          )
        )}

        {/* Location Fields */}
        {(["city", "state", "country"] as (keyof UserProfile)[]).map(
          (field) => (
            <div key={field} className="account-settings-section">
              <label>{fieldLabels[field]}</label>
              <input
                type="text"
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
              />
            </div>
          )
        )}

        {/* Gender Select */}
        <div className="account-settings-section">
          <label>{fieldLabels.gender}</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value }))
            }
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div className="account-settings-section">
          <label>{fieldLabels.dob}</label>
          <input
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
          />
        </div>

        {/* Favorite Color */}
        <div className="account-settings-section">
          <label>{fieldLabels.favoriteColor}</label>
          <input
            type="color"
            name="favoriteColor"
            value={formData.favoriteColor || "#ffffff"}
            onChange={handleChange}
          />
        </div>

        <div className="account-settings-section">
          <label>{fieldLabels.bio}</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={200}
          />
        </div>

        <div className="account-settings-section">
          <label>{fieldLabels.sports}</label>
          <div className="account-settings-sports">
            {formData.sports.map((sport) => (
              <span key={sport} className="account-settings-sport-tag">
                {sport}
                <button
                  type="button"
                  onClick={() => handleSportChange("remove", sport)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="account-settings-sport-picker">
            <select
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
            >
              <option value="">-- Select a sport --</option>
              {allowedSports
                .filter((sport) => !formData.sports.includes(sport))
                .map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => handleSportChange("add", newSport)}
              disabled={!newSport}
            >
              Add Sport
            </button>
          </div>
        </div>

        <button type="submit" className="account-settings-save-button">
          Save Changes
        </button>
        <hr
          style={{
            margin: "2rem 0",
            border: "none",
            borderTop: "1px solid #333",
          }}
        />

        <div className="account-settings-section">
          <button
            type="button"
            className="account-settings-delete-button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;
