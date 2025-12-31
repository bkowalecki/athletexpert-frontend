import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorFallback from "../ErrorFallback";

interface Props {
  children: ReactNode;

  /**
   * Optional: wire into analytics/logging (Sentry, GA, etc.)
   * No behavior change if not provided.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep your existing behavior
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, errorInfo);

    // Optional external hook
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", marginTop: 80, padding: "0 16px" }}>
          <ErrorFallback
            error={this.state.error ?? "An unexpected error occurred."}
            resetErrorBoundary={this.resetErrorBoundary}
          />

          {/* Secondary recovery path (keeps your old UX available) */}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                fontSize: 16,
                backgroundColor: "#A23C20",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              aria-label="Refresh the page"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
