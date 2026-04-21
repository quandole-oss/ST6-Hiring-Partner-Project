const STORAGE_KEY = "wc_auth";

let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export function setToken(token: string | null): void {
  currentToken = token;
}

export function loadTokenFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) currentToken = token;
    }
  } catch {
    currentToken = null;
  }
}
