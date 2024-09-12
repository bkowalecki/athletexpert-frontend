import React, { useState } from "react";
import "../styles/Quiz.css";
import sportsData from "../data/sports.json";

// Define the structure for answers
type Answers = {
  sports?: string[];
  playlistVibe?: string;
  gearStyle?: string;
  fitnessGoal?: string;
  trainingFrequency?: string;
};

const Quiz: React.FC = () => {
  const [step, setStep] = useState(0); // Track the current step
  const [progress, setProgress] = useState(0); // Track progress
  const [selectedSports, setSelectedSports] = useState<string[]>([]); // Store selected sports
  const [answers, setAnswers] = useState<Answers>({}); // Store all quiz answers
  const [isTransitioning, setIsTransitioning] = useState(false); // Handle transition state

  // Handle selecting a sport (toggle selection)
  const handleSportSelect = (sportTitle: string) => {
    if (selectedSports.includes(sportTitle)) {
      setSelectedSports(selectedSports.filter((sport) => sport !== sportTitle));
    } else if (selectedSports.length < 5) {
      setSelectedSports([...selectedSports, sportTitle]);
    }
  };

  // Move to the next question
  const handleNext = (currentAnswer: string | string[], field: keyof Answers) => {
    setAnswers((prevAnswers: Answers) => ({
      ...prevAnswers,
      [field]: currentAnswer, // Add current answer to the answers object
    }));

    // Trigger the transition effect
    setIsTransitioning(true);

    // Delay the step change for the transition effect
    setTimeout(() => {
      setStep(step + 1); // Move to the next question
      setProgress(((step + 1) / 5) * 100); // Update progress bar based on 5 steps
      setIsTransitioning(false); // End the transition
    }, 500); // Adjust delay to match transition duration
  };

  // Questions to be displayed based on the current step
  return (
    <div className={`quiz-container ${isTransitioning ? "fade-out" : ""}`}>
      {step === 0 && (
        <>
          <h2>Which sport(s) are you shopping for? (Select up to 5)</h2>
          <div className="quiz-grid">
            {sportsData.map((sport) => (
              <div
                key={sport.title}
                className={`quiz-item ${
                  selectedSports.includes(sport.title) ? "selected" : ""
                }`}
                onClick={() => handleSportSelect(sport.title)}
              >
                <img src={sport.logo} alt={sport.title} className="quiz-icon" />
                <p className="quiz-title">{sport.title}</p>
              </div>
            ))}
          </div>
          <button
            className="next-button"
            onClick={() => handleNext(selectedSports, "sports")}
            disabled={selectedSports.length === 0 || selectedSports.length > 5}
          >
            Next
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h2>What’s your go-to workout playlist vibe?</h2>
          <div className="quiz-options">
            {["Rock", "Pop", "Hip-Hop", "Electronic"].map((option) => (
              <button
                key={option}
                className={`quiz-option ${
                  answers.playlistVibe === option ? "selected" : ""
                }`}
                onClick={() => handleNext(option, "playlistVibe")}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>How do you like your gear: flashy or classic?</h2>
          <div className="quiz-options">
            {["Flashy", "Classic"].map((option) => (
              <button
                key={option}
                className={`quiz-option ${
                  answers.gearStyle === option ? "selected" : ""
                }`}
                onClick={() => handleNext(option, "gearStyle")}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2>What’s your primary fitness goal?</h2>
          <div className="quiz-options">
            {["Build Muscle", "Lose Weight", "Increase Endurance", "Improve Flexibility"].map((option) => (
              <button
                key={option}
                className={`quiz-option ${
                  answers.fitnessGoal === option ? "selected" : ""
                }`}
                onClick={() => handleNext(option, "fitnessGoal")}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2>How often do you train?</h2>
          <div className="quiz-options">
            {["1-2 times per week", "3-4 times per week", "5-6 times per week", "Daily"].map((option) => (
              <button
                key={option}
                className={`quiz-option ${
                  answers.trainingFrequency === option ? "selected" : ""
                }`}
                onClick={() => handleNext(option, "trainingFrequency")}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default Quiz;
