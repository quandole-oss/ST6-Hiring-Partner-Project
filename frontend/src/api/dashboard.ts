import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./client";
import { shouldUseMock, getMockSummary } from "../services/aiSummaryService";
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

export function useTeamSummary(teamId: string, teamName?: string) {
  return useQuery({
    queryKey: ["dashboard", "summary", teamId],
    queryFn: () =>
      shouldUseMock()
        ? getMockSummary(teamId, teamName ?? "Team")
        : api.get<TeamSummary>(`/dashboard/team/${teamId}/summary`),
    enabled: false,
  });
}

export interface AiQaRequest {
  question: string;
  teamId?: string;
}

export interface AiQaResponse {
  question: string;
  answer: string;
  generatedAt: string;
}

export function useAiQa() {
  return useMutation({
    mutationFn: (data: AiQaRequest) =>
      api.post<AiQaResponse>("/dashboard/ai/ask", data),
  });
}
