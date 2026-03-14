import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { Team, TeamMember } from "../types";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get<Team[]>("/teams"),
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => api.get<TeamMember[]>(`/teams/${teamId}/members`),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
