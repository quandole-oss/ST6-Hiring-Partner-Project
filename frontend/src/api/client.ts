import { getToken } from "./tokenStore";

const BASE_URL = "/api/v1";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

let onUnauthorized: (() => void) | null = null;
let redirecting = false;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (DEMO_MODE) return headers;
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function handle401(res: Response) {
  if (DEMO_MODE) return;
  if (res.status === 401) {
    if (redirecting) return;
    redirecting = true;
    if (onUnauthorized) {
      onUnauthorized();
    }
    setTimeout(() => { redirecting = false; }, 2000);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: authHeaders(),
      ...options,
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }
  if (!res.ok) {
    handle401(res);
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? body?.detail ?? `Request failed: ${res.status}`);
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
    fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: authHeaders() }).then(async (res) => {
      if (!res.ok) {
        handle401(res);
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? body?.detail ?? `Delete failed: ${res.status}`);
      }
    }),
};
