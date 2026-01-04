import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import "../../styles/Quiz.css";

import sportsData from "../../data/sports.json";
import quizData from "../../data/quizData.json";

import ProductCard from "../products/ProductCard";
import cleanProductTitle from "../../util/CleanProductTitle";
import { trackEvent } from "../../util/analytics";
import { useQuiz } from "../../context/QuizContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import SportsCarousel from "../../components/SportsCarousel";

const AMAZON_ASSOCIATE_TAG = "athletexper0b-20";

const FUNNY_LOADING_TEXTS = [
  "Finding the best gear for you…",
  "Sharpening your spikes…",
  "Polishing your pickleballs…",
  "Consulting LeBron’s cousin…",
  "Summoning the equipment fairy…",
  "Chasing down the UPS truck…",
  "Clearing the sweatbands…",
  "Checking the locker room…",
  "Negotiating with Amazon bots…",
  "Applying extra stickum…",
  "Arguing with the referee…",
];

type SportKey = keyof typeof quizData.sportSpecific;

type Answers = {
  sport: string;
  skillLevel: string;
  trainingFrequency: string;
  budget: string;
  favoriteColor: string;
  [key: string]: string;
};

type RecommendedProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  slug: string;
  affiliateLink: string;
};

const initialAnswers: Answers = {
  sport: "",
  skillLevel: "",
  trainingFrequency: "",
  budget: "",
  favoriteColor: "",
};

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
          aria-pressed={selectedOption === option}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>

    {showBack && (
      <div className="quiz-navigation">
        <button className="quiz-nav-button back" onClick={onBack} type="button">
          ← Back
        </button>
      </div>
    )}
  </>
);

const Quiz: React.FC<{ isOpen: boolean; closeModal: () => void }> = ({
  isOpen,
  closeModal,
}) => {
  const { dispatch } = useQuiz();

  const [step, setStep] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const mainQuestions = useMemo(
    () => quizData.questions.filter((q: any) => q.field !== "sport"),
    []
  );

  const quizQuestions = useMemo(() => {
    if (!answers.sport) return [];

    const sportKey = answers.sport.toLowerCase() as SportKey | undefined;
    const sportQs =
      sportKey && quizData.sportSpecific?.[sportKey]
        ? quizData.sportSpecific[sportKey]
        : [];

    const sportFields = new Set(sportQs.map((q: any) => q.field));
    const globalQs = mainQuestions.filter(
      (q: any) => !sportFields.has(q.field)
    );

    return [...sportQs, ...globalQs];
  }, [answers.sport, mainQuestions]);

  const totalSteps = 1 + quizQuestions.length;

  const currentQuestion =
    step > 0 && step <= quizQuestions.length ? quizQuestions[step - 1] : null;

  const progress =
    step === 0
      ? 0
      : Math.min(100, Math.round((step / quizQuestions.length) * 100));

  // Loading text rotation
  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }

    setLoadingTextIndex(
      Math.floor(Math.random() * FUNNY_LOADING_TEXTS.length)
    );

    const interval = setInterval(() => {
      setLoadingTextIndex(
        (prev) => (prev + 1) % FUNNY_LOADING_TEXTS.length
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch recommendations
  useEffect(() => {
    if (step !== totalSteps) return;

    setIsLoading(true);

    fetch(`${process.env.REACT_APP_API_URL}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(answers),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: RecommendedProduct[]) => {
        setRecommendedProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    if (answers.favoriteColor) {
      dispatch({
        type: "SET_FAVORITE_COLOR",
        color: answers.favoriteColor,
      });
    }

    trackEvent("quiz_complete", answers);
  }, [step, totalSteps, answers, dispatch]);

  const handleNext = useCallback((field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((prev) => prev - 1);
  }, [step]);

  // Scroll lock
  useEffect(() => {
    document.body.classList.toggle("scroll-lock", isOpen);
    return () => document.body.classList.remove("scroll-lock");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="quiz-modal"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="quiz-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          className="close-button"
          onClick={closeModal}
          type="button"
          aria-label="Close quiz"
        >
          ✕
        </button>

        <div className="quiz-progress-bar">
          <div className="quiz-progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-scrollable-content">
          {isLoading ? (
            <LoadingSpinner text={FUNNY_LOADING_TEXTS[loadingTextIndex]} />
          ) : (
            <>
              {step === 0 && (
                <>
                  <h2 className="quiz-question">
                    What sport are you shopping for?
                  </h2>
                  <SportsCarousel
                    sports={sportsData}
                    currentIndex={carouselIndex}
                    setCurrentIndex={setCarouselIndex}
                    onSelect={(sport) =>
                      handleNext("sport", sport.title.toLowerCase())
                    }
                  />
                </>
              )}

              {step > 0 && step < totalSteps && currentQuestion && (
                <QuizStep
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  selectedOption={answers[currentQuestion.field]}
                  onNext={(option) =>
                    handleNext(currentQuestion.field, option)
                  }
                  onBack={handleBack}
                  showBack
                />
              )}

              {step === totalSteps && !isLoading && (
                <div className="quiz-product-grid">
                  {recommendedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={cleanProductTitle(product.name)}
                      brand={product.brand}
                      price={product.price}
                      imgUrl={product.imgUrl}
                      slug={product.slug}
                      affiliateLink={appendAffiliateTag(
                        product.affiliateLink,
                        AMAZON_ASSOCIATE_TAG
                      )}
                    />
                  ))}
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
