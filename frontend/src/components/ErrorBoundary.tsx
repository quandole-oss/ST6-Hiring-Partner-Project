import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Stale-bundle detection. After a redeploy, old lazy-loaded chunks
 * (e.g. `assets/SettingsPage-{oldhash}.js`) no longer exist on the CDN
 * and React's dynamic `import()` rejects with a chunk-load failure.
 *
 * We reload the page once per session when this happens: the fresh
 * document fetches the new `index.html` and its new chunk manifest.
 * Guarded by a sessionStorage flag so we don't infinite-loop if the
 * reload itself fails.
 */
function isChunkLoadError(err: Error): boolean {
  const msg = String(err?.message || "");
  const stack = String(err?.stack || "");
  return (
    /failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(err?.name || "") ||
    /ChunkLoadError/i.test(stack)
  );
}

const RELOADED_FLAG = "wc:stale-bundle-reloaded";

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (isChunkLoadError(error)) {
      try {
        if (!sessionStorage.getItem(RELOADED_FLAG)) {
          sessionStorage.setItem(RELOADED_FLAG, "1");
          window.location.reload();
        }
      } catch {
        // sessionStorage can throw in sandboxed contexts; fall through
        // to the UI fallback below.
      }
    }
  }

  render() {
    if (this.state.error) {
      const stale = isChunkLoadError(this.state.error);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {stale ? "New version available" : "Something went wrong"}
            </h2>
            <p className="text-sm text-red-600">
              {stale
                ? "This page was updated. Reload to get the latest version."
                : this.state.error.message}
            </p>
            <button
              onClick={() => {
                if (stale) {
                  try {
                    sessionStorage.removeItem(RELOADED_FLAG);
                  } catch {
                    // ignore
                  }
                  window.location.reload();
                } else {
                  this.setState({ error: null });
                }
              }}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              {stale ? "Reload" : "Try again"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
