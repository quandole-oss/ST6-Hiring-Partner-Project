import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { DashboardTeam, AlignmentScore, TeamSummary } from "../types";

export function useTeamDashboard(teamId: string) {
  return useQuery({
    queryKey: ["dashboard", "team", teamId],
    queryFn: () => api.get<DashboardTeam>(`/dashboard/team/${teamId}`),
    enabled: !!teamId,
  });
}

export function useAlignmentMetrics() {
  return useQuery({
    queryKey: ["dashboard", "alignment"],
    queryFn: () => api.get<AlignmentScore>("/dashboard/alignment"),
  });
}

export function useTeamSummary(teamId: string) {
  return useQuery({
    queryKey: ["dashboard", "summary", teamId],
    queryFn: () => api.get<TeamSummary>(`/dashboard/team/${teamId}/summary`),
    enabled: false,
  });
}
