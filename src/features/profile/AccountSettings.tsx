import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import sportsList from "../../data/sports.json";
import "../../styles/AccountSettings.css";
import type { UserProfile } from "../../types/users";
import { updateUserProfile, deleteUserAccount } from "../../api/user";

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
] as const;

const MAX_AVATAR_BYTES = 2_000_000; // 2MB guardrail for base64 storage

const AccountSettings: React.FC = () => {
  const { user, setUser, isSessionChecked } = useUserContext();
  const navigate = useNavigate();

  const allowedSports = useMemo(() => {
    return Array.isArray(sportsList) ? sportsList.map((s: any) => s.title).filter(Boolean) : [];
  }, []);

  const [formData, setFormData] = useState<UserProfile>({ ...defaultProfile });
  const [newSport, setNewSport] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // If session is checked and no user, bounce to auth (prevents editing blank default state)
  useEffect(() => {
    if (!isSessionChecked) return;
    if (!user) navigate("/auth", { replace: true });
  }, [isSessionChecked, user, navigate]);

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

  const updateField = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setMsg("Image is too large. Please use a smaller image (≤ 2MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((f) => ({
        ...f,
        profilePictureUrl: (reader.result as string) || "",
      }));
    reader.readAsDataURL(file);
  }, []);

  const handleSportChange = useCallback(
    (action: "add" | "remove", sport: string) => {
      const trimmed = sport?.trim();
      if (!trimmed) return;

      // only allow sports that exist in sports.json
      if (!allowedSports.includes(trimmed)) return;

      setFormData((f) => {
        const current = Array.isArray(f.sports) ? f.sports : [];
        if (action === "add") {
          if (current.includes(trimmed)) return f; // prevent duplicates
          return { ...f, sports: [...current, trimmed] };
        }
        return { ...f, sports: current.filter((s) => s !== trimmed) };
      });

      if (action === "add") setNewSport("");
    },
    [allowedSports]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMsg(null);
      setIsSaving(true);

      try {
        // Normalize a bit to keep payload clean
        const payload: UserProfile = {
          ...formData,
          username: formData.username.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          city: (formData.city ?? "").trim(),
          state: (formData.state ?? "").trim(),
          country: (formData.country ?? "").trim(),
          gender: formData.gender ?? "",
          dob: formData.dob ?? "",
          bio: (formData.bio ?? "").trim(),
          sports: Array.isArray(formData.sports) ? formData.sports : [],
          profilePictureUrl: formData.profilePictureUrl ?? "",
          favoriteColor: formData.favoriteColor ?? "#ffffff",
        };

        const updated = await updateUserProfile(payload);
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));
        setMsg("Profile updated!");
      } catch {
        setMsg("Failed to update profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [formData, setUser]
  );

  const handleDeleteAccount = useCallback(async () => {
    const ok = window.confirm(
      "⚠️ Deleting your account is permanent. All your data will be removed. Continue?"
    );
    if (!ok) return;

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
  }, [setUser]);

  if (!isSessionChecked) {
    return (
      <div className="account-settings-container">
        <p style={{ textAlign: "center", paddingTop: 80, color: "#888" }}>
          Loading your settings...
        </p>
      </div>
    );
  }

  // if session checked but user missing, the redirect effect will run;
  // render a minimal shell to avoid flicker
  if (!user) {
    return (
      <div className="account-settings-container">
        <p style={{ textAlign: "center", paddingTop: 80, color: "#888" }}>
          Redirecting...
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
              loading="lazy"
              decoding="async"
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
              value={formData[f] ?? ""}
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
            <input type="text" name={f} value={formData[f] || ""} onChange={updateField} />
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
          <textarea name="bio" value={formData.bio ?? ""} onChange={updateField} maxLength={200} />
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

        <button type="submit" className="account-settings-save-button" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
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
