import React, { useState, useContext, useEffect } from "react";
import "../../styles/Quiz.css";
import sportsData from "../../data/sports.json";
import { QuizContext } from "../../context/QuizContext";
import LoadingSpinner from "../../components/LoadingSpinner";

// Types
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  affiliateLink: string;
}

interface QuizQuestion {
  question: string;
  field: keyof typeof initialAnswers;
  options: string[];
}

interface QuizProps {
  isOpen: boolean;
  closeModal: () => void;
}

type AnswerKey = keyof typeof initialAnswers;

const initialAnswers = {
  sport: "",
  skillLevel: "",
  trainingFrequency: "",
  budget: "",
  favoriteColor: "",
};

const AMAZON_ASSOCIATE_TAG = "athletexpert-20";

const appendAffiliateTag = (url: string, tag: string) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("tag", tag); // Add or replace the 'tag' query param
  return urlObj.toString(); // Return the updated URL as a string
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
          className={`quiz-option ${
            selectedOption === option ? "selected" : ""
          }`}
          onClick={() => onNext(option)}
        >
          {option}
        </button>
      ))}
    </div>
  </>
);

const Quiz: React.FC<QuizProps> = ({ isOpen, closeModal }) => {
  const { dispatch } = useContext(QuizContext);
  const [step, setStep] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 5;

  const [answers, setAnswers] = useState(initialAnswers);

  // Define quizQuestions with proper typing
  const quizQuestions: QuizQuestion[] = [
    {
      question: `What's your skill level in ${initialAnswers.sport ? initialAnswers.sport : 'your sport'} ?`,
      field: "skillLevel",
      options: ["Beginner", "Intermediate", "Advanced", "Professional"],
    },
    {
      question: "How often do you play/train?",
      field: "trainingFrequency",
      options: [
        "1-2 times per week",
        "3-4 times per week",
        "5-6 times per week",
        "Daily",
      ],
    },
    {
      question: "What's your budget?",
      field: "budget",
      options: ["Under $50", "$50-$100", "$100-$200", "Over $200"],
    },
    {
      question: "What's your favorite color?",
      field: "favoriteColor",
      options: ["Red", "Blue", "Green", "Yellow", "Purple", "Black", "White"],
    },
  ];

  useEffect(() => {
    if (step === totalSteps) {
      setIsLoading(true);
      fetch(`${process.env.REACT_APP_API_URL}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleClose = () => {
    closeModal(); // Closes the modal
  };

    // Use useEffect to control overflow based on modal visibility
    useEffect(() => {
      if (isOpen) {
        // Prevent scrolling when modal is open
        document.body.style.overflow = "hidden";
      } else {
        // Re-enable scrolling when modal is closed
        document.body.style.overflow = "auto";
      }
  
      // Cleanup when the component unmounts or modal closes
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);



  if (!isOpen){
    
    return null;}

  return (
    <div className="quiz-modal" onClick={handleClose}>

<button className="close-button" onClick={handleClose}>
          <svg viewBox="0 0 24 24">
            <path d="M18.3 5.71a1 1 0 0 0-1.42-1.42L12 9.17 7.11 4.29A1 1 0 0 0 5.7 5.71L10.58 10.6 5.7 15.48a1 1 0 0 0 1.41 1.41L12 11.99l4.89 4.89a1 1 0 0 0 1.42-1.41l-4.88-4.89 4.88-4.89Z" />
          </svg>
        </button>

      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="quiz-container">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {step === 0 && (
                <>
                  <h2>What sport are you shopping for?</h2>
                  <div className="carousel-container">
                    <button
                      className="carousel-button left"
                      onClick={() => handleCarousel("left")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 50 100"
                        fill="currentColor"
                        width="24px"
                        height="80px"
                      >
                        <path
                          d="M40 5 L10 50 L40 95"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                        />
                      </svg>
                    </button>

                    <div
                      className="carousel-item-container"
                      style={{
                        transform: `translateX(-${carouselIndex * 100}%)`,
                      }}
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 50 100"
                        fill="currentColor"
                        width="24px"
                        height="80px"
                      >
                        <path
                          d="M10 5 L40 50 L10 95"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="quiz-navigation">
                    <button
                      className="quiz-nav-button"
                      onClick={() =>
                        handleNext("sport", sportsData[carouselIndex].title.toLowerCase())
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {step > 0 && step <= 4 && (
                <QuizStep
                question={
                  step === 1
                    ? `What's your skill level in ${answers.sport}?`
                    : quizQuestions[step - 1].question
                }
                  options={quizQuestions[step - 1].options}
                  selectedOption={answers[quizQuestions[step - 1].field]}
                  onNext={(option) =>
                    handleNext(quizQuestions[step - 1].field, option)
                    
                  }
                />
              )}

              {/* {step === 5 && (
                <QuizStep
                  question="What's your favorite color?"
                  options={[
                    "Red",
                    "Blue",
                    "Green",
                    "Yellow",
                    "Purple",
                    "Black",
                    "White",
                  ]}
                  selectedOption={answers.favoriteColor}
                  onNext={(option) => {
                    dispatch({ type: "SET_FAVORITE_COLOR", color: option });
                    handleNext("favoriteColor", option);
                  
                  }}
                />
              )} */}

              {step === totalSteps && (
                <div className="recommended-products">
                  <h3>Recommended For You</h3>
                  <div className="quiz-product-grid">
                    {recommendedProducts.map((product, index) => (
                      <div key={index} className="quiz-product-card animate-product">
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={product.imgUrl}
                            alt={product.name}
                            className="quiz-product-image"
                          />
                        </a>
                        <h4>{product.name}</h4>
                        {/* <p>${product.price.toFixed(2)}</p> */}
                        <a
                          href={appendAffiliateTag(
                            product.affiliateLink,
                            AMAZON_ASSOCIATE_TAG
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="buy-button"
                        >
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
      </div>
    </div>
  );
};

export default Quiz;
