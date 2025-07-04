import React, { useEffect, useRef } from "react";

interface ErrorFallbackProps {
  error: Error | { message: string } | string;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Accessibility: focus the button on mount
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  // Defensive error handling
  const errorMessage =
    typeof error === "string"
      ? error
      : error && "message" in error
      ? error.message
      : "An unknown error occurred.";

  return (
    <div
      className="error-fallback-container"
      role="alertdialog"
      aria-labelledby="error-fallback-title"
      aria-describedby="error-fallback-desc"
      tabIndex={-1}
    >
      <h2 id="error-fallback-title" className="error-fallback-title">
        Something went wrong.
      </h2>
      <p id="error-fallback-desc" className="error-fallback-message">
        {errorMessage}
      </p>
      <button
        ref={buttonRef}
        onClick={resetErrorBoundary}
        className="error-fallback-button"
        aria-label="Try to recover from error"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;
