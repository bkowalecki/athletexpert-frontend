import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import "../../styles/Quiz.css";
import sportsData from "../../data/sports.json";
import quizData from "../../data/quizData.json";
import ProductCard from "../products/ProductCard";
import cleanProductTitle from "../../util/CleanProductTitle";
import { trackEvent } from "../../util/analytics";
import { QuizContext } from "../../context/QuizContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import SportsCarousel, { Sport } from "../../components/SportsCarousel"; // adjust path
const AMAZON_ASSOCIATE_TAG = "athletexper0b-20";

type SportKey = keyof typeof quizData.sportSpecific;

const appendAffiliateTag = (url: string, tag: string) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("tag", tag);
  return urlObj.toString();
};

const QuizStep: React.FC<{
  question: string;
  options: string[];
  selectedOption: string;
  onNext: (option: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}> = ({ question, options, selectedOption, onNext, onBack, showBack }) => (
  <>
    <h2 className="quiz-question">{question}</h2>
    <div className="quiz-options">
      {options.map((option) => (
        <button
          key={option}
          className={`quiz-option ${
            selectedOption === option ? "selected" : ""
          }`}
          onClick={() => onNext(option)}
          tabIndex={0}
          aria-pressed={selectedOption === option}
        >
          {option}
        </button>
      ))}
    </div>
    {showBack && (
      <div className="quiz-navigation">
        <button className="quiz-nav-button back" onClick={onBack}>
          <span aria-hidden="true">&#8592;</span> Back
        </button>
      </div>
    )}
  </>
);

const initialAnswers = {
  sport: "",
  skillLevel: "",
  trainingFrequency: "",
  budget: "",
  favoriteColor: "",
  // add more fields as needed (dynamically handled)
};

const Quiz: React.FC<{ isOpen: boolean; closeModal: () => void }> = ({
  isOpen,
  closeModal,
}) => {
  const { dispatch } = useContext(QuizContext);
  const [step, setStep] = useState(0); // 0 = sport selector
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<any>(initialAnswers);

  // --- SPORT-SPECIFIC AND MAIN QUESTION LOGIC ---
  const selectedSport = answers.sport?.toLowerCase() as SportKey | undefined;
  const sportSpecificQuestions = useMemo(() => {
    if (
      selectedSport &&
      quizData.sportSpecific &&
      selectedSport in quizData.sportSpecific
    ) {
      return (
        (quizData.sportSpecific as Record<SportKey, any[]>)[selectedSport] || []
      );
    }
    return [];
  }, [selectedSport]);

  // Remove global questions whose 'field' matches any in sportSpecific for dedupe
  const sportSpecificFields = new Set(
    sportSpecificQuestions.map((q: any) => q.field)
  );
  const mainQuestions = quizData.questions.filter(
    (q: any) => !sportSpecificFields.has(q.field) && q.field !== "sport"
  );

  // Build the full ordered list of questions (after sport is selected)
  const allQuizQuestions = [...sportSpecificQuestions, ...mainQuestions];
  const totalSteps = 1 + allQuizQuestions.length; // 1 for sport selection, rest for all questions

  // Progress bar logic
  const progress =
    step === 0
      ? 0
      : Math.min(100, Math.round((step / allQuizQuestions.length) * 100));

  // Recommendation fetch
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
    // eslint-disable-next-line
  }, [step, answers, totalSteps]);

  // Next and Back
  const handleNext = (field: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    if (step === totalSteps) {
      setStep(step - 1);
      return;
    }
    if (step > 0) {
      // Find field for this step and clear answer (optional)
      const fieldToClear = allQuizQuestions[step - 1]?.field;
      setAnswers((prev: any) => {
        const updated = { ...prev };
        if (fieldToClear) updated[fieldToClear] = "";
        return updated;
      });
      setStep((prev) => prev - 1);
    }
  };

  // Carousel arrows and swipe
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleCarousel = (direction: "left" | "right") => {
    setCarouselIndex((prevIndex) =>
      direction === "left"
        ? prevIndex === 0
          ? sportsData.length - 1
          : prevIndex - 1
        : prevIndex === sportsData.length - 1
        ? 0
        : prevIndex + 1
    );
  };

  // Touch event handlers for carousel swipe
  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 36) {
        if (deltaX > 0) handleCarousel("left");
        else handleCarousel("right");
      }
      touchStartX.current = null;
    };

    node.addEventListener("touchstart", handleTouchStart);
    node.addEventListener("touchend", handleTouchEnd);

    return () => {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchend", handleTouchEnd);
    };
  }, [carouselRef, step, carouselIndex]);

  // Lock body scroll
  useEffect(() => {
    const body = document.body;
    if (isOpen) body.classList.add("scroll-lock");
    else body.classList.remove("scroll-lock");
    return () => body.classList.remove("scroll-lock");
  }, [isOpen]);

  // Carousel keyboard nav
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

  return (
    <div
      className="quiz-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Gear Recommendation Quiz"
      onClick={closeModal}
    >
      <div
        className="quiz-modal-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="document"
      >
        <button
          className="close-button"
          onClick={closeModal}
          aria-label="Close quiz modal"
          type="button"
        >
          <svg viewBox="0 0 24 24">
            <path d="M18.3 5.71a1 1 0 0 0-1.42-1.42L12 9.17 7.11 4.29A1 1 0 0 0 5.7 5.71L10.58 10.6 5.7 15.48a1 1 0 0 0 1.41 1.41L12 11.99l4.89 4.89a1 1 0 0 0 1.42-1.41l-4.88-4.89 4.88-4.89Z" />
          </svg>
        </button>
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemax={100}
            aria-valuemin={0}
          />
        </div>
        <div className="quiz-scrollable-content">
          {isLoading ? (
            <div className="quiz-loading-overlay">
              <div className="quiz-spinner-container">
                <LoadingSpinner />
                <div className="quiz-loading-text">
                  Finding the best gear for you…
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 0: Netflix-style Sport Selection Carousel */}
              {step === 0 && (
                <>
                  <h2 className="quiz-question">
                    What sport are you shopping for?
                  </h2>
                  <SportsCarousel
                    sports={sportsData}
                    currentIndex={carouselIndex}
                    setCurrentIndex={setCarouselIndex}
                    onSelect={(sport) => {
                      // User clicks the middle icon or hits Enter
                      handleNext("sport", sport.title.toLowerCase());
                    }}
                  />
                  <div className="quiz-navigation">
                    <button
                      className="quiz-nav-button quiz-nav-next"
                      onClick={() =>
                        handleNext(
                          "sport",
                          sportsData[carouselIndex].title.toLowerCase()
                        )
                      }
                      tabIndex={0}
                      type="button"
                    >
                      Next <span aria-hidden="true">&#8594;</span>
                    </button>
                  </div>
                </>
              )}

              {/* Sport-specific and global steps */}
              {step > 0 && step < totalSteps && (
                <QuizStep
                  question={
                    allQuizQuestions[step - 1]?.field === "skillLevel" &&
                    answers.sport
                      ? `What's your skill level in ${answers.sport}?`
                      : allQuizQuestions[step - 1].question
                  }
                  options={allQuizQuestions[step - 1].options}
                  selectedOption={answers[allQuizQuestions[step - 1].field]}
                  onNext={(option) =>
                    handleNext(allQuizQuestions[step - 1].field, option)
                  }
                  onBack={handleBack}
                  showBack={step > 0}
                />
              )}

              {/* Recommendations display */}
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
                    <button
                      className="quiz-nav-button back"
                      onClick={handleBack}
                    >
                      <span aria-hidden="true">&#8592;</span> Back
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
