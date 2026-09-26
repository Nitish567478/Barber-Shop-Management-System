import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);

    // Auto-reload once if dynamic import / new chunk hash failure after a deployment
    const isChunkLoadFailed =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkLoadFailed) {
      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
              <AlertCircle size={28} />
            </div>

            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              We encountered an issue displaying this page. A recent update may have been deployed.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-300 active:scale-95 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/10 cursor-pointer"
              >
                <Home size={14} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
