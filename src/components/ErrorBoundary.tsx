import React from "react";

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // You can log error to external service here
    // console.error("ErrorBoundary caught", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-xl rounded border bg-white p-6 text-center shadow">
          <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
          <p className="mb-4 text-sm text-muted-foreground">The app encountered an error while loading. You can try to go to the login page or reload.</p>
          <div className="flex gap-3 justify-center">
            <button
              className="rounded bg-emerald-600 px-3 py-2 text-sm text-white"
              onClick={() => {
                try {
                  window.localStorage.removeItem("e-pashu-session-user");
                } catch {}
                window.location.href = window.location.origin + window.location.pathname + "#/login";
              }}
            >
              Go to Login
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={() => window.location.reload()}>Reload</button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Error: {String(this.state.error?.message || "unknown")}</div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
