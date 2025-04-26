import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/OnboardingPage.css";

const sportsOptions = [
  "Running", "Basketball", "Soccer", "Swimming", "Cycling", "Tennis", "Yoga", "Weightlifting", "Climbing", "Hiking"
];

const favoriteColors = ["Red", "Blue", "Green", "Orange", "Purple", "Black", "White", "Pink", "Yellow", "Teal"];

type FormDataType = {
  firstName: string;
  lastName: string;
  favoriteColor: string;
  sports: string[];
  bio: string;
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    favoriteColor: "",
    sports: [],
    bio: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSport = (sport: string) => {
    setFormData((prev) => {
      const newSports = prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport];
      return { ...prev, sports: newSports };
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      await axios.post(`${process.env.REACT_APP_API_URL}/users/account-setup`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting onboarding data:", error);
      alert("Failed to complete onboarding. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>What's your name?</h2>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <button className="onboarding-btn" onClick={() => setStep(2)}>Next ➔</button>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>Pick your favorite color</h2>
            <div className="color-options">
              {favoriteColors.map((color) => (
                <div
                  key={color}
                  className={`color-option ${formData.favoriteColor === color ? "selected" : ""}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => setFormData({ ...formData, favoriteColor: color })}
                ></div>
              ))}
            </div>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(1)}>← Back</button>
              <button className="onboarding-btn" onClick={() => setStep(3)}>Next ➔</button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>Select your sports squad!</h2>
            <div className="sports-grid">
              {sportsOptions.map((sport) => (
                <div
                  key={sport}
                  className={`sport-option ${formData.sports.includes(sport) ? "selected" : ""}`}
                  onClick={() => toggleSport(sport)}
                >
                  {sport}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(2)}>← Back</button>
              <button className="onboarding-btn" onClick={() => setStep(4)}>Next ➔</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2>Write your story!</h2>
            <textarea
              name="bio"
              placeholder="Tell us about yourself (Optional)"
              value={formData.bio}
              onChange={handleChange}
            ></textarea>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(3)}>← Back</button>
              <button className="onboarding-btn" onClick={handleSubmit}>Finish ✅</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      {renderStep()}
    </div>
  );
};

export default OnboardingPage;
