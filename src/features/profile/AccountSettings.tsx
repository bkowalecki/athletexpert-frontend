import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useUserContext } from "../../context/UserContext";
import sportsList from "../../data/sports.json";
import "../../styles/AccountSettings.css";
import type { UserProfile } from "../../types/users";
import { updateUserProfile, deleteUserAccount } from "../../api/user";

const allowedSports = Array.isArray(sportsList)
  ? sportsList.map((s: any) => s.title)
  : [];

const defaultProfile: UserProfile = {
  username: "",
  firstName: "",
  lastName: "",
  bio: "",
  profilePictureUrl: "",
  sports: [],
  city: "",
  state: "",
  country: "",
  gender: "",
  dob: "",
  favoriteColor: "#ffffff",
};

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

const genderOptions = [
  { value: "", label: "-- Select Gender --" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const AccountSettings: React.FC = () => {
  const { user, setUser, isSessionChecked } = useUserContext(); // ✅ include isSessionChecked
  const [formData, setFormData] = useState<UserProfile>({ ...defaultProfile });
  const [newSport, setNewSport] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || !isSessionChecked) return;

    setFormData({
      ...defaultProfile,
      ...user,
      bio: user.bio ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      country: user.country ?? "",
      gender: user.gender ?? "",
      dob: user.dob ?? "",
      favoriteColor: user.favoriteColor ?? "#ffffff",
      sports: Array.isArray(user.sports) ? user.sports : [],
      profilePictureUrl: user.profilePictureUrl || "",
    });
  }, [user, isSessionChecked]);

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((f) => ({
        ...f,
        profilePictureUrl: reader.result as string,
      }));
    reader.readAsDataURL(file);
  };

  const handleSportChange = (action: "add" | "remove", sport: string) => {
    setFormData((f) => ({
      ...f,
      sports:
        action === "add"
          ? [...f.sports, sport]
          : f.sports.filter((s) => s !== sport),
    }));
    if (action === "add") setNewSport("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const updated = await updateUserProfile(formData);
      setUser(prev => prev ? { ...prev, ...updated } : prev);
      setMsg("Profile updated!");
    } catch {
      setMsg("Failed to update profile. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm("⚠️ Deleting your account is permanent. All your data will be removed. Continue?")
    )
      return;
    setIsDeleting(true);
    setMsg(null);
    try {
      await deleteUserAccount();
      setUser(null);
      setMsg("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1800);
    } catch {
      setMsg("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSessionChecked) {
    return (
      <div className="account-settings-container">
        <p style={{ textAlign: "center", paddingTop: 80, color: "#888" }}>
          Loading your settings...
        </p>
      </div>
    );
  }

  return (
    <div className="account-settings-container">
      <Helmet>
        <title>Account Settings | AthleteXpert</title>
      </Helmet>
      <h2>Account Settings</h2>
      {msg && <div className="account-settings-message">{msg}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Profile Picture */}
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

        {/* Basic Info */}
        {(["username", "firstName", "lastName"] as const).map((f) => (
          <div key={f} className="account-settings-section">
            <label>{fieldLabels[f]}</label>
            <input
              type="text"
              name={f}
              value={formData[f]}
              onChange={updateField}
              required={f === "username"}
              autoComplete={f === "username" ? "username" : undefined}
            />
          </div>
        ))}

        {/* Location */}
        {(["city", "state", "country"] as const).map((f) => (
          <div key={f} className="account-settings-section">
            <label>{fieldLabels[f]}</label>
            <input
              type="text"
              name={f}
              value={formData[f] || ""}
              onChange={updateField}
            />
          </div>
        ))}

        {/* Gender */}
        <div className="account-settings-section">
          <label>{fieldLabels.gender}</label>
          <select name="gender" value={formData.gender || ""} onChange={updateField}>
            {genderOptions.map(({ value, label }) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* DOB */}
        <div className="account-settings-section">
          <label>{fieldLabels.dob}</label>
          <input
            type="date"
            name="dob"
            value={formData.dob ? formData.dob.slice(0, 10) : ""}
            onChange={updateField}
            autoComplete="bday"
          />
        </div>

        {/* Favorite Color */}
        <div className="account-settings-section">
          <label>{fieldLabels.favoriteColor}</label>
          <input
            type="color"
            name="favoriteColor"
            value={formData.favoriteColor || "#ffffff"}
            onChange={updateField}
          />
        </div>

        {/* Bio */}
        <div className="account-settings-section">
          <label>{fieldLabels.bio}</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={updateField}
            maxLength={200}
          />
        </div>

        {/* Sports Picker */}
        <div className="account-settings-section">
          <label>{fieldLabels.sports}</label>
          <div className="account-settings-sports">
            {formData.sports.map((sport) => (
              <span key={sport} className="account-settings-sport-tag">
                {sport}
                <button
                  type="button"
                  onClick={() => handleSportChange("remove", sport)}
                  aria-label={`Remove ${sport}`}
                >
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

        <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid #333" }} />

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
