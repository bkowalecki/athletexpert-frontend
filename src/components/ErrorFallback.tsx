import React from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div role="alert" style={{ padding: "2rem", background: "#ffecec", borderRadius: 8 }}>
    <h2 style={{ color: "#c00" }}>Something went wrong.</h2>
    <p style={{ margin: "1rem 0" }}>{error.message}</p>
    <button onClick={resetErrorBoundary} style={{ padding: "0.5rem 1.5rem", borderRadius: 4, background: "#c00", color: "#fff", border: "none" }}>
      Try Again
    </button>
  </div>
);

export default ErrorFallback;
