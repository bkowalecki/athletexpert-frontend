import React, { useState } from "react";
import "../styles/Quiz.css";
import sportsData from "../data/sports.json";

// Define the structure for answers
type Answers = {
  sport?: string;
  skillLevel?: string;
  fitnessGoal?: string;
  trainingFrequency?: string;
  budget?: string;
  favoriteColor?: string; // Added favorite color
};

const Quiz: React.FC = () => {
  const [carouselIndex, setCarouselIndex] = useState(0); // Track carousel index for sports
  const [touchStart, setTouchStart] = useState<number | null>(null); // For handling touch swipe
  const [answers, setAnswers] = useState<Answers>({}); // Store quiz answers
  const [step, setStep] = useState(0); // Track the current step

  // Move to the next question (e.g., sport selection)
  const handleNext = (field: keyof Answers, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [field]: value,
    }));
    setStep(step + 1); // Move to the next step
  };

  // Move carousel left or right with loop-around functionality
  const handleCarousel = (direction: "left" | "right") => {
    if (direction === "left") {
      setCarouselIndex(
        carouselIndex === 0 ? sportsData.length - 1 : carouselIndex - 1
      );
    } else if (direction === "right") {
      setCarouselIndex(
        carouselIndex === sportsData.length - 1 ? 0 : carouselIndex + 1
      );
    }
  };

  // Handle swipe events for touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.touches[0].clientX;
    const difference = touchStart - touchEnd;

    if (difference > 50) {
      handleCarousel("right");
    }

    if (difference < -50) {
      handleCarousel("left");
    }

    setTouchStart(null); // Reset after swipe
  };

  return (
    <div className="quiz-container">
      {/* Step 1: Sport Selection with Carousel */}
      {step === 0 && (
        <>
          <h2>Which sport are you shopping for?</h2>

          <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Left arrow */}
            <button
              className="carousel-button left"
              onClick={() => handleCarousel("left")}
            >
              &#x25C0; {/* Left arrow */}
            </button>

            {/* Carousel items */}
            <div
              className="carousel-item-container"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {sportsData.map((sport, index) => (
                <div key={index} className="carousel-item">
                  <img
                    src={sport.logo}
                    alt={sport.title}
                    className="quiz-icon"
                  />
                  <p className="carousel-text">{sport.title}</p>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              className="carousel-button right"
              onClick={() => handleCarousel("right")}
            >
              &#x25B6; {/* Right arrow */}
            </button>
          </div>

          <button
            className="next-button"
            onClick={() => handleNext("sport", sportsData[carouselIndex].title)}
          >
            Next
          </button>
        </>
      )}

      {/* Step 2: Skill Level */}
      {step === 1 && (
        <>
          <h2>What is your skill level?</h2>
          <div className="quiz-options">
            {["Beginner", "Intermediate", "Advanced", "Professional"].map(
              (option) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    answers.skillLevel === option ? "selected" : ""
                  }`}
                  onClick={() => handleNext("skillLevel", option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </>
      )}

      {/* Step 3: Fitness Goal */}
      {step === 2 && (
        <>
          <h2>What is your fitness goal?</h2>
          <div className="quiz-options">
            {["Build Muscle", "Lose Weight", "Increase Endurance", "Improve Flexibility"].map(
              (option) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    answers.fitnessGoal === option ? "selected" : ""
                  }`}
                  onClick={() => handleNext("fitnessGoal", option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </>
      )}

      {/* Step 4: Training Frequency */}
      {step === 3 && (
        <>
          <h2>How often do you play/train?</h2>
          <div className="quiz-options">
            {["1-2 times per week", "3-4 times per week", "5-6 times per week", "Daily"].map(
              (option) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    answers.trainingFrequency === option ? "selected" : ""
                  }`}
                  onClick={() => handleNext("trainingFrequency", option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </>
      )}

      {/* Step 5: Budget */}
      {step === 4 && (
        <>
          <h2>What is your budget?</h2>
          <div className="quiz-options">
            {["Under $50", "$50-$100", "$100-$200", "Over $200"].map(
              (option) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    answers.budget === option ? "selected" : ""
                  }`}
                  onClick={() => handleNext("budget", option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </>
      )}

        {/* Bonus Step: Favorite Color */}
        {step === 5 && (
        <>
          <h2>What is your favorite color?</h2>
          <div className="quiz-options">
            {["Red", "Blue", "Green", "Yellow", "Purple", "Black", "White"].map(
              (option) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    answers.favoriteColor === option ? "selected" : ""
                  }`}
                  onClick={() => handleNext("favoriteColor", option)}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </>
      )}

      

      {/* Final Step: Thank you or Results */}
      {step === 6 && (
        <>
          <h2>Thank you for completing the quiz!</h2>
          <p>Here are your selections:</p>
          <ul>
            <li><strong>Sport:</strong> {answers.sport}</li>
            <li><strong>Skill Level:</strong> {answers.skillLevel}</li>
            <li><strong>Fitness Goal:</strong> {answers.fitnessGoal}</li>
            <li><strong>Training Frequency:</strong> {answers.trainingFrequency}</li>
            <li><strong>Budget:</strong> {answers.budget}</li>
            <li><strong>Favorite Color:</strong> {answers.favoriteColor}</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Quiz;






