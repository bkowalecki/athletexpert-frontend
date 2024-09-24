import React, { useState, useContext, useEffect } from "react";
import "../styles/Quiz.css";
import sportsData from "../data/sports.json";
// import axios from "axios"; // Comment this out if not needed for now
import { QuizContext } from "./QuizContext"; // Context for global values like favoriteColor

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  link: string;
}

interface QuizProps {
  closeModal: () => void; // Prop to close the modal
}

const Quiz: React.FC<QuizProps> = ({ closeModal }) => {
  // Local state for quiz steps and answers
  const [step, setStep] = useState(0);
  const totalSteps = 6;
  const [carouselIndex, setCarouselIndex] = useState(0); // Track carousel index
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]); // Products
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({
    sport: "",
    skillLevel: "",
    fitnessGoal: "",
    trainingFrequency: "",
    budget: "",
    favoriteColor: "",
  });

  const { dispatch } = useContext(QuizContext); // Use context for specific state

  useEffect(() => {
    if (step === 6) {
      setIsLoading(true); // Start loading
      fetch("http://localhost:8080/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers), // Sending answers from quiz
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Recommended products:", data);
          setRecommendedProducts(data); // Set the recommendations
          setIsLoading(false); // Stop loading
        })
        .catch((error) => {
          console.error("Error fetching recommendations:", error);
          setIsLoading(false); // Stop loading in case of an error
        });
    }
  }, [step, answers]);

  const handleNext = (field: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [field]: value,
    }));

    if (step === 5) {
      // For step 5 (favorite color), dispatch the selected color and finish the quiz
      dispatch({ type: "SET_FAVORITE_COLOR", color: value });
      setStep(step + 1); // Move to the "Thank You" step (step 6)
    } else {
      setStep(step + 1); // Move to the next step
    }
  };

  const handleSubmitQuiz = () => {
    // Simulate a successful submission and log the data
    console.log("Quiz submitted successfully with answers: ", answers);
    closeModal(); // Close modal when quiz finishes
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

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        <div style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>

      {step === 0 && (
        <>
          <h2>Which sport are you shopping for?</h2>

          <div className="carousel-container">
            <button
              className="carousel-button left"
              onClick={() => handleCarousel("left")}
            >
              &#x25C0;
            </button>

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

            <button
              className="carousel-button right"
              onClick={() => handleCarousel("right")}
            >
              &#x25B6;
            </button>
          </div>

          <div className="quiz-navigation">
            <button
              className="nav-button"
              onClick={() =>
                handleNext("sport", sportsData[carouselIndex].title)
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {step > 0 && step <= 4 && (
        <>
          <h2>
            {step === 1
              ? "What is your skill level?"
              : step === 2
              ? "What is your fitness goal?"
              : step === 3
              ? "How often do you play/train?"
              : "What is your budget?"}
          </h2>
          <div className="quiz-options">
            {step === 1
              ? ["Beginner", "Intermediate", "Advanced", "Professional"].map(
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
                )
              : step === 2
              ? [
                  "Build Muscle",
                  "Lose Weight",
                  "Increase Endurance",
                  "Improve Flexibility",
                ].map((option) => (
                  <button
                    key={option}
                    className={`quiz-option ${
                      answers.fitnessGoal === option ? "selected" : ""
                    }`}
                    onClick={() => handleNext("fitnessGoal", option)}
                  >
                    {option}
                  </button>
                ))
              : step === 3
              ? [
                  "1-2 times per week",
                  "3-4 times per week",
                  "5-6 times per week",
                  "Daily",
                ].map((option) => (
                  <button
                    key={option}
                    className={`quiz-option ${
                      answers.trainingFrequency === option ? "selected" : ""
                    }`}
                    onClick={() => handleNext("trainingFrequency", option)}
                  >
                    {option}
                  </button>
                ))
              : ["Under $50", "$50-$100", "$100-$200", "Over $200"].map(
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

      {/* Step 5: Favorite Color */}
      {/* Step 5: Choose favorite color */}
      {step === 5 && (
        <>
          <h2>What is your favorite color?</h2>
          <div className="quiz-options">
            {["Red", "Blue", "Green", "Yellow", "Purple", "Black", "White"].map(
              (color) => (
                <button
                  key={color}
                  className={`quiz-option ${
                    answers.favoriteColor === color ? "selected" : ""
                  }`}
                  onClick={() => handleNext("favoriteColor", color)} // Store color and proceed
                >
                  {color}
                </button>
              )
            )}
          </div>
        </>
      )}

      {/* Step 6: Thank you screen */}
      {step === 6 && (
        <>
          <h2>Thank you for completing the quiz!</h2>
          <p>Here are your selections:</p>
          <ul>
            <li>
              <strong>Sport:</strong> {answers.sport}
            </li>
            <li>
              <strong>Skill Level:</strong> {answers.skillLevel}
            </li>
            <li>
              <strong>Fitness Goal:</strong> {answers.fitnessGoal}
            </li>
            <li>
              <strong>Training Frequency:</strong> {answers.trainingFrequency}
            </li>
            <li>
              <strong>Budget:</strong> {answers.budget}
            </li>
            <li>
              <strong>Favorite Color:</strong> {answers.favoriteColor}
            </li>
          </ul>

          {/* Display recommended products */}
          <div className="recommended-products">
            <h3>Recommended Products</h3>
            <div className="product-grid">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />
                  <h4>{product.name}</h4>
                  <p>by {product.brand}</p>
                  <p>${product.price.toFixed(2)}</p>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-button"
                  >
                    Buy Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button className="nav-button" onClick={handleSubmitQuiz}>
              Finish
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz;
