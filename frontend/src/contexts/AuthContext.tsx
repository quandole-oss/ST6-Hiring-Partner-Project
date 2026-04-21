import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { setToken, loadTokenFromStorage } from "../api/tokenStore";
import { setOnUnauthorized } from "../api/client";

interface AuthState {
  token: string;
  memberId: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthState | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  demoMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "wc_auth";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_USER: AuthState = {
  token: "demo",
  memberId: "e0000000-0000-0000-0000-000000000001",
  name: "Alice Chen",
  role: "LEAD",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(() => {
    if (DEMO_MODE) return DEMO_USER;
    loadTokenFromStorage();
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error("Invalid credentials");
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ token: data.token, memberId: data.memberId, name: data.name, role: data.role });
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const res = await fetch("/api/v1/auth/oauth2/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      throw new Error("Google login failed");
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ token: data.token, memberId: data.memberId, name: data.name, role: data.role });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, demoMode: DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
