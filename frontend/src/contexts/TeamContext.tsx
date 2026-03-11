import { createContext, useContext, useState, type ReactNode } from "react";
import { getCurrentMonday } from "../utils/week";

interface TeamContextValue {
  teamId: string;
  setTeamId: (id: string) => void;
  weekStart: string;
}

const TeamContext = createContext<TeamContextValue | null>(null);

const STORAGE_KEY = "wc_team";

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamId, setTeamIdState] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const setTeamId = (id: string) => {
    setTeamIdState(id);
    try {
      if (id) {
        sessionStorage.setItem(STORAGE_KEY, id);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable
    }
  };

  const weekStart = getCurrentMonday();

  return (
    <TeamContext.Provider value={{ teamId, setTeamId, weekStart }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamContext must be used within TeamProvider");
  return ctx;
}
