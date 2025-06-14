import ReactCanvasConfetti from "react-canvas-confetti";
import { useRef } from "react";
import React, { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

import { toast } from "react-toastify"; // 👈 Add this at top if you want a nice popup
import { useNavigate } from "react-router-dom";
import "../../styles/OnboardingPage.css";
import { useUserContext } from "../../context/UserContext";
import sportsData from "../../data/sports.json";


const sportsOptions = sportsData.map((s) => s.title);

const favoriteColors = [
  "Red",
  "Blue",
  "Green",
  "Orange",
  "Purple",
  "Black",
  "White",
  "Pink",
  "Yellow",
  "Teal",
];

type FormDataType = {
  firstName: string;
  lastName: string;
  favoriteColor: string;
  sports: string[];
  bio: string;
  city?: string;
  state?: string;
  country?: string;
  dob?: string;
  gender?: string;
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    favoriteColor: "",
    sports: [],
    bio: "",
  });

  const confettiRef = useRef<any>(null);

  const getInstance = (instance: any) => {
    confettiRef.current = instance;
  };

  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.confetti({
        particleCount: 150,
        spread: 90,
        startVelocity: 45,
        gravity: 0.9,
        ticks: 200,
        scalar: 1.2,
        origin: { y: 0.6 },
        shapes: ["circle"], // ✅ Force simple circle shapes
      });
    }
  };

  const totalSteps = 6;
  const progressPercentage = Math.round((step / totalSteps) * 100);

  const { user, isSessionChecked } = useUserContext();

  useEffect(() => {
    if (isSessionChecked && (!user || !user.username)) {
      toast.error("Session error. Please log in again.");
      navigate("/auth", { replace: true });
    }
  }, [user, isSessionChecked, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("Please enter both your first name and last name.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/account-setup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            favoriteColor: formData.favoriteColor,
            bio: formData.bio,
            sports: formData.sports,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            dob: formData.dob,
            gender: formData.gender,
          })
          ,
        }
      );

      if (response.ok) {
        console.log("✅ Account setup complete!");
        setTimeout(() => {
          fireConfetti(); // 🎉 Slight delay ensures canvas and confetti instance are ready
          toast.success(`🎉 Welcome to AthleteXpert, ${formData.firstName}!`, {
            position: "top-center",
          });
          navigate("/profile");
        }, 300); // 300ms is plenty
      } else {
        console.error("❌ Failed to submit onboarding form");
      }
    } catch (error) {
      console.error("❌ Error submitting onboarding:", error);
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
            <button className="onboarding-btn" onClick={() => setStep(2)}>
              Next ➔
            </button>
            <button
              className="onboarding-skip-btn"
              onClick={() => navigate("/profile")}
              style={{
                marginTop: "15px",
                background: "transparent",
                color: "#555",
                border: "none",
                cursor: "pointer",
              }}
            >
              Skip and finish later
            </button>
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
                  className={`color-option ${
                    formData.favoriteColor === color ? "selected" : ""
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() =>
                    setFormData({ ...formData, favoriteColor: color })
                  }
                ></div>
              ))}
            </div>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="onboarding-btn" onClick={() => setStep(3)}>
                Next ➔
              </button>
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
                  className={`sport-option ${
                    formData.sports.includes(sport) ? "selected" : ""
                  }`}
                  onClick={() => toggleSport(sport)}
                >
                  {sport}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="onboarding-btn" onClick={() => setStep(4)}>
                Next ➔
              </button>
            </div>
          </div>
        );
  
      case 4:
        return (
          <div className="onboarding-step">
            <h2>Where are you located?</h2>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country || ""}
              onChange={handleChange}
            />
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button className="onboarding-btn" onClick={() => setStep(5)}>
                Next ➔
              </button>
            </div>
          </div>
        );
  
      case 5:
        return (
          <div className="onboarding-step">
            <h2>Tell us a bit more</h2>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Prefer Not to Say">Prefer Not to Say</option>
            </select>
            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleChange}
            />
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(4)}>
                ← Back
              </button>
              <button className="onboarding-btn" onClick={() => setStep(6)}>
                Next ➔
              </button>
            </div>
          </div>
        );
  
      case 6:
        return (
          <div className="onboarding-step">
            <h2>Bio</h2>
            <textarea
              name="bio"
              placeholder="Tell us about yourself (Optional)"
              value={formData.bio}
              onChange={handleChange}
            ></textarea>
            <div className="button-group">
              <button className="onboarding-btn" onClick={() => setStep(5)}>
                ← Back
              </button>
              <button className="onboarding-btn" onClick={handleSubmit}>
                Finish ✅
              </button>
            </div>
          </div>
        );
  
      default:
        return null;
    }
  };
  

  return (
    <div className="onboarding-container">
      <Helmet>
        <title>Welcome | AthleteXpert</title>
        <meta
          name="description"
          content="Set up your AthleteXpert profile and start your athletic journey!"
        />
      </Helmet>

      <div className="progress-container">
        <div className="progress-text">
          Step {step} of {totalSteps}
        </div>
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      {renderStep()}
      <ReactCanvasConfetti
        onInit={getInstance}
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default OnboardingPage;
