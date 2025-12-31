import React, { useEffect, useMemo, useRef } from "react";

interface ErrorFallbackProps {
  error: Error | { message: string } | string;
  resetErrorBoundary: () => void;
}

function getErrorMessage(error: ErrorFallbackProps["error"]): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unknown error occurred.";
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Accessibility: focus the button on mount
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const errorMessage = useMemo(() => getErrorMessage(error), [error]);

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

      <p
        id="error-fallback-desc"
        className="error-fallback-message"
        aria-live="assertive"
      >
        {errorMessage}
      </p>

      <button
        type="button"
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
