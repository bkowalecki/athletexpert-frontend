import React, { useState, useContext, useEffect } from "react";
import "../styles/Quiz.css";
import sportsData from "../data/sports.json";
import { QuizContext } from "./QuizContext";
import LoadingSpinner from "./LoadingSpinner";

// Types
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  affiliateLink: string;
}

interface QuizProps {
  closeModal: () => void;
}

type AnswerKey = keyof typeof initialAnswers;

const initialAnswers = {
  sport: "",
  skillLevel: "",
  fitnessGoal: "",
  trainingFrequency: "",
  budget: "",
  favoriteColor: "",
};

// Component for a quiz step with multiple options
const QuizStep: React.FC<{
  question: string;
  options: string[];
  selectedOption: string;
  onNext: (option: string) => void;
}> = ({ question, options, selectedOption, onNext }) => (
  <>
    <h2>{question}</h2>
    <div className="quiz-options">
      {options.map((option) => (
        <button
          key={option}
          className={`quiz-option ${selectedOption === option ? "selected" : ""}`}
          onClick={() => onNext(option)}
        >
          {option}
        </button>
      ))}
    </div>
  </>
);

const Quiz: React.FC<QuizProps> = ({ closeModal }) => {
  const { dispatch } = useContext(QuizContext);
  const [step, setStep] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;

  const [answers, setAnswers] = useState(initialAnswers);

  useEffect(() => {
    if (step === totalSteps) {
      setIsLoading(true);
      fetch(`${process.env.REACT_APP_API_URL}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setRecommendedProducts(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [step, answers]);

  const handleNext = (field: AnswerKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setStep(step + 1);
  };

  const handleCarousel = (direction: "left" | "right") => {
    if (direction === "left") {
      setCarouselIndex((prevIndex) =>
        prevIndex === 0 ? sportsData.length - 1 : prevIndex - 1
      );
    } else if (direction === "right") {
      setCarouselIndex((prevIndex) =>
        prevIndex === sportsData.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  // Ensure the carousel-item-container moves based on carouselIndex
  const carouselStyle = {
    transform: `translateX(-${carouselIndex * 100}%)`,
  };

  const quizQuestions = [
    {
      question: "What's your skill level?",
      field: "skillLevel" as AnswerKey,
      options: ["Beginner", "Intermediate", "Advanced", "Professional"],
    },
    {
      question: "What's your fitness goal?",
      field: "fitnessGoal" as AnswerKey,
      options: [
        "Build Strength",
        "Lose Weight",
        "Gain Weight",
        "Increase Stamina",
        "Improve Flexibility",
        "Boost Mobility",
      ],
    },
    {
      question: "How often do you play/train?",
      field: "trainingFrequency" as AnswerKey,
      options: [
        "1-2 times per week",
        "3-4 times per week",
        "5-6 times per week",
        "Daily",
      ],
    },
    {
      question: "What's your budget?",
      field: "budget" as AnswerKey,
      options: ["Under $50", "$50-$100", "$100-$200", "Over $200"],
    },
  ];

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        <div style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {step === 0 && (
            <>
              <h2>What sport are you looking for?</h2>
              <div className="carousel-container">
                <button className="carousel-button left" onClick={() => handleCarousel("left")}>
                  &#x25C0;
                </button>
                <div className="carousel-item-container" style={carouselStyle}>
                  {sportsData.map((sport, index) => (
                    <div key={index} className="carousel-item">
                      <img src={sport.logo} alt={sport.title} className="quiz-icon" />
                      <p className="carousel-text">{sport.title}</p>
                    </div>
                  ))}
                </div>
                <button className="carousel-button right" onClick={() => handleCarousel("right")}>
                  &#x25B6;
                </button>
              </div>
              <div className="quiz-navigation">
                <button className="nav-button" onClick={() => handleNext("sport", sportsData[carouselIndex].title)}>
                  Next
                </button>
              </div>
            </>
          )}

          {step > 0 && step <= 4 && (
            <QuizStep
              question={quizQuestions[step - 1].question}
              options={quizQuestions[step - 1].options}
              selectedOption={answers[quizQuestions[step - 1].field]}
              onNext={(option) => handleNext(quizQuestions[step - 1].field, option)}
            />
          )}

          {step === 5 && (
            <QuizStep
              question="What's your favorite color?"
              options={["Red", "Blue", "Green", "Yellow", "Purple", "Black", "White"]}
              selectedOption={answers.favoriteColor}
              onNext={(option) => {
                dispatch({ type: "SET_FAVORITE_COLOR", color: option });
                handleNext("favoriteColor", option);
              }}
            />
          )}

          {step === totalSteps && (
            <div className="recommended-products">
              <h3>Recommended Products</h3>
              <div className="product-grid">
                {recommendedProducts.map((product, index) => (
                  <div key={index} className="product-card animate-product">
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      <img src={product.imgUrl} alt={product.name} className="product-image" />
                    </a>
                    <h4>{product.name}</h4>
                    <p>${product.price.toFixed(2)}</p>
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="buy-button">
                      View on Amazon
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
