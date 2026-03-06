const BASE_URL = "/api/v1";
const STORAGE_KEY = "wc_auth";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (DEMO_MODE) return headers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function handle401(res: Response) {
  if (DEMO_MODE) return;
  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  if (!res.ok) {
    handle401(res);
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) =>
    fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: authHeaders() }).then((res) => {
      if (!res.ok) {
        handle401(res);
        throw new Error(`Delete failed: ${res.status}`);
      }
    }),
};
