import React from "react";
import "../styles/ErrorScreen.css"; // Adjust if needed

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => (
  <div
    className="ax-error-screen"
    role="alert"
    aria-live="assertive"
  >
    <p className="ax-error-message">{message}</p>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="ax-error-retry"
        aria-label="Retry the failed action"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorScreen;
