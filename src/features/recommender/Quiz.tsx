import React, { useState, useContext, useEffect } from "react";
import "../../styles/Quiz.css";
import sportsData from "../../data/sports.json";
import quizData from "../../data/quizData.json";
import ProductCard from "../products/ProductCard";
import cleanProductTitle from "../../util/CleanProductTitle";
import { trackEvent } from "../../util/analytics";
import { QuizContext } from "../../context/QuizContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const AMAZON_ASSOCIATE_TAG = "athletexper0b-20";

const appendAffiliateTag = (url: string, tag: string) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("tag", tag);
  return urlObj.toString();
};

// Quiz Step Component
const QuizStep: React.FC<{
  question: string;
  options: string[];
  selectedOption: string;
  onNext: (option: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}> = ({ question, options, selectedOption, onNext, onBack, showBack }) => (
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
    {showBack && (
      <div className="quiz-navigation">
        <button className="quiz-nav-button back" onClick={onBack}>
          &#8592; Back
        </button>
      </div>
    )}
  </>
);

const Quiz: React.FC<{ isOpen: boolean; closeModal: () => void }> = ({
  isOpen,
  closeModal,
}) => {
  const { dispatch } = useContext(QuizContext);
  const [step, setStep] = useState(0); // 0 = sport selector
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<any>({ sport: "" });

  // Sport-specific then global
  type SportSpecificKey = keyof typeof quizData.sportSpecific;
  const selectedSport = answers.sport?.toLowerCase() as SportSpecificKey;
  const sportSpecificQuestions =
    quizData.sportSpecific &&
    selectedSport &&
    selectedSport in quizData.sportSpecific
      ? quizData.sportSpecific[selectedSport]
      : [];
  const mainQuestions = quizData.questions;
  const allQuestions = [...sportSpecificQuestions, ...mainQuestions];
  const totalSteps = 1 + allQuestions.length;

  // For back button logic, store the field name of each step
  const questionFields = allQuestions.map(q => q.field);

  // Recommendations
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

      trackEvent("quiz_complete", answers);
    }
  }, [step, answers, totalSteps]);

  // Next and Back
  const handleNext = (field: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    // If on the results screen, go back to the last question
    if (step === totalSteps) {
      setStep(step - 1);
      return;
    }
    if (step > 0) {
      // Clear answer for this step's field (optional, keeps data clean)
      const fieldToClear = allQuestions[step - 1]?.field;
      setAnswers((prev: any) => {
        const updated = { ...prev };
        if (fieldToClear) updated[fieldToClear] = "";
        return updated;
      });
      setStep((prev) => prev - 1);
    }
  };

  // Carousel
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

  // Modal/overflow logic
  useEffect(() => {
    const body = document.body;
    if (isOpen) body.classList.add("scroll-lock");
    else body.classList.remove("scroll-lock");
    return () => body.classList.remove("scroll-lock");
  }, [isOpen]);

  // Carousel keyboard navigation on step 0
  useEffect(() => {
    if (step === 0) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") handleCarousel("left");
        if (e.key === "ArrowRight") handleCarousel("right");
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step]);

  if (!isOpen) return null;

  // Progress bar logic (excludes sport selection step)
  const progress =
    step === 0
      ? 0
      : Math.min(100, Math.round((step / allQuestions.length) * 100));

  return (
    <div className="quiz-modal" onClick={closeModal}>
      <button className="close-button" onClick={closeModal}>
        <svg viewBox="0 0 24 24">
          <path d="M18.3 5.71a1 1 0 0 0-1.42-1.42L12 9.17 7.11 4.29A1 1 0 0 0 5.7 5.71L10.58 10.6 5.7 15.48a1 1 0 0 0 1.41 1.41L12 11.99l4.89 4.89a1 1 0 0 0 1.42-1.41l-4.88-4.89 4.88-4.89Z" />
        </svg>
      </button>
      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-container">
          {/* Progress bar */}
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemax={100}
              aria-valuemin={0}
            />
          </div>
          {isLoading ? (
            <div className="quiz-loading-overlay">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Sport selection carousel */}
              {step === 0 && (
                <>
                  <h2>What sport are you shopping for?</h2>
                  <div className="carousel-container">
                    <button
                      className="carousel-button left"
                      onClick={() => handleCarousel("left")}
                    >
                      &lt;
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
                      &gt;
                    </button>
                  </div>
                  <div className="quiz-navigation">
                    {/* No back button on sport select step */}
                    <button
                      className="quiz-nav-button"
                      onClick={() =>
                        handleNext(
                          "sport",
                          sportsData[carouselIndex].title.toLowerCase()
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
              {/* Sport-specific THEN global questions, with Back */}
              {step > 0 && step < totalSteps && (
                <QuizStep
                  question={
                    // Custom label for skill level
                    allQuestions[step - 1].field === "skillLevel" && answers.sport
                      ? `What's your skill level in ${answers.sport}?`
                      : allQuestions[step - 1].question
                  }
                  options={allQuestions[step - 1].options}
                  selectedOption={answers[allQuestions[step - 1].field]}
                  onNext={(option) =>
                    handleNext(allQuestions[step - 1].field, option)
                  }
                  onBack={handleBack}
                  showBack={step > 0}
                />
              )}
              {/* Recommendations display, Back on summary */}
              {step === totalSteps && (
                <div className="recommended-products">
                  <h3 className="recommended-products-title">
                    Recommended For You
                  </h3>
                  <div className="quiz-product-grid">
                    {recommendedProducts.map((product) => (
                      <ProductCard
                        id={product.id}
                        key={product.id}
                        name={cleanProductTitle(product.name)}
                        brand={product.brand}
                        price={product.price}
                        imgUrl={product.imgUrl}
                        affiliateLink={appendAffiliateTag(
                          product.affiliateLink,
                          AMAZON_ASSOCIATE_TAG
                        )}
                      />
                    ))}
                  </div>
                  <div className="quiz-navigation">
                    <button className="quiz-nav-button back" onClick={handleBack}>
                      &#8592; Back
                    </button>
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
