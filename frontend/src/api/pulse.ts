import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { HighFive, RetrospectiveEntry } from "../types";

export function useHighFives(weekStart: string) {
  return useQuery({
    queryKey: ["highFives", weekStart],
    queryFn: () => api.get<HighFive[]>(`/pulse/high-fives?weekStart=${weekStart}`),
    enabled: !!weekStart,
  });
}

export function useCreateHighFive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { receiverTeamId: string; weekStart: string; message: string; isPublic: boolean }) =>
      api.post<HighFive>("/pulse/high-fives", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["highFives"] }),
  });
}

export function useDeleteHighFive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/pulse/high-fives/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["highFives"] }),
  });
}

export function useRetrospectives(weekStart: string) {
  return useQuery({
    queryKey: ["retrospectives", weekStart],
    queryFn: () => api.get<RetrospectiveEntry[]>(`/pulse/retrospectives?weekStart=${weekStart}`),
    enabled: !!weekStart,
  });
}

export function useUpsertRetrospective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { weekStart: string; outcomeId?: string; promptKey: string; response: string }) =>
      api.post<RetrospectiveEntry>("/pulse/retrospectives", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["retrospectives"] }),
  });
}
