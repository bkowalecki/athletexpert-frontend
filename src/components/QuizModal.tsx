import React from "react";
import Quiz from "./Quiz";
import "../styles/QuizModal.css";

interface QuizModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div className="quiz-modal" onClick={closeModal}>
      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeModal}>
          <svg viewBox="0 0 24 24">
            <path d="M18.3 5.71a1 1 0 0 0-1.42-1.42L12 9.17 7.11 4.29A1 1 0 0 0 5.7 5.71L10.58 10.6 5.7 15.48a1 1 0 0 0 1.41 1.41L12 11.99l4.89 4.89a1 1 0 0 0 1.42-1.41l-4.88-4.89 4.88-4.89Z" />
          </svg>
        </button>
        <Quiz closeModal={closeModal} />
      </div>
    </div>
  );
};

export default QuizModal;
