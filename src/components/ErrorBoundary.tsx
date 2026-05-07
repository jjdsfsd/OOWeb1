import React, { Component } from "react";

export class ErrorBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-gray-600">The app crashed. Let’s fix it.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-red-600 px-8 py-4 text-white hover:bg-red-700"
          >
            Reload the App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
