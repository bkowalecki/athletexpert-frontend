import React, {
  useRef,
  useState,
  ChangeEvent,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../styles/OnboardingPage.css";
import { useUserContext } from "../../context/UserContext";
import sportsData from "../../data/sports.json";
import api from "../../api/axios";

type ConfettiInstance = {
  confetti: (opts: Record<string, unknown>) => void;
};

const sportsOptions = Array.isArray(sportsData)
  ? sportsData.map((s: any) => s.title).filter(Boolean)
  : [];

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

const TOTAL_STEPS = 6;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSessionChecked } = useUserContext();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    favoriteColor: "",
    sports: [],
    bio: "",
  });

  const confettiRef = useRef<ConfettiInstance | null>(null);

  const progressPercentage = Math.round((step / TOTAL_STEPS) * 100);

  // ---------- Auth guard ----------
  useEffect(() => {
    if (!isSessionChecked) return;

    if (!user) {
      toast.error("Session expired. Please log in again.");
      navigate("/auth", { replace: true });
      return;
    }

    if (user.isActive) {
      navigate("/profile", { replace: true });
    }
  }, [user, isSessionChecked, navigate]);

  // ---------- Confetti ----------
  const getInstance = useCallback((instance: ConfettiInstance | null) => {
    confettiRef.current = instance;
  }, []);

  const fireConfetti = useCallback(() => {
    confettiRef.current?.confetti({
      particleCount: 150,
      spread: 90,
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200,
      scalar: 1.2,
      origin: { y: 0.6 },
      shapes: ["circle"],
    });
  }, []);

  // ---------- Handlers ----------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const toggleSport = useCallback((sport: string) => {
    setFormData((prev) => {
      const exists = prev.sports.includes(sport);
      return {
        ...prev,
        sports: exists
          ? prev.sports.filter((s) => s !== sport)
          : [...prev.sports, sport],
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter both your first and last name.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/users/account-setup", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        favoriteColor: formData.favoriteColor,
        bio: formData.bio.trim(),
        sports: formData.sports,
        city: formData.city?.trim(),
        state: formData.state?.trim(),
        country: formData.country?.trim(),
        dob: formData.dob,
        gender: formData.gender,
      });

      fireConfetti();
      toast.success(`🎉 Welcome to AthleteXpert, ${formData.firstName}!`, {
        position: "top-center",
      });

      setTimeout(() => navigate("/profile"), 500);
    } catch {
      toast.error("❌ Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Step Renderer ----------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>What's your name?</h2>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
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
                    setFormData((f) => ({ ...f, favoriteColor: color }))
                  }
                />
              ))}
            </div>
            <div className="button-group">
              <button onClick={() => setStep(1)}>← Back</button>
              <button onClick={() => setStep(3)}>Next ➔</button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>Select your sports and activities</h2>
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
              <button onClick={() => setStep(2)}>← Back</button>
              <button onClick={() => setStep(4)}>Next ➔</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2>Where are you located?</h2>
            <input name="city" placeholder="City" value={formData.city || ""} onChange={handleChange} />
            <input name="state" placeholder="State" value={formData.state || ""} onChange={handleChange} />
            <input
              name="country"
              placeholder="Country"
              value={formData.country || ""}
              onChange={handleChange}
            />
            <div className="button-group">
              <button onClick={() => setStep(3)}>← Back</button>
              <button onClick={() => setStep(5)}>Next ➔</button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="onboarding-step">
            <h2>Tell us a bit more</h2>
            <select name="gender" value={formData.gender || ""} onChange={handleChange}>
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Prefer Not to Say">Prefer Not to Say</option>
            </select>
            <input type="date" name="dob" value={formData.dob || ""} onChange={handleChange} />
            <div className="button-group">
              <button onClick={() => setStep(4)}>← Back</button>
              <button onClick={() => setStep(6)}>Next ➔</button>
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
            />
            <div className="button-group">
              <button onClick={() => setStep(5)}>← Back</button>
              <button className="onboarding-btn" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Finishing..." : "Finish ✅"}
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
          Step {step} of {TOTAL_STEPS}
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
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
