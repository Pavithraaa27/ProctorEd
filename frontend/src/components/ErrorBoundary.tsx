import React from "react";
import { AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-alert-soft border border-alert/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-alert" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink mb-2">Something went wrong</h1>
            <p className="text-ink-muted text-sm mb-6">
              This screen hit an unexpected error. Your exam progress up to this point is saved on the server.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-signal hover:bg-signal/90 text-void font-semibold transition-colors duration-200 rounded-xl px-6 py-2.5 text-sm"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
