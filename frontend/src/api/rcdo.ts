import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { RallyCry, DefiningObjective, Outcome } from "../types";

export function useRallyCries() {
  return useQuery({
    queryKey: ["rallyCries"],
    queryFn: () => api.get<RallyCry[]>("/rcdo/rally-cries"),
  });
}

export function useRallyCry(id: string) {
  return useQuery({
    queryKey: ["rallyCries", id],
    queryFn: () => api.get<RallyCry>(`/rcdo/rally-cries/${id}`),
  });
}

export function useCreateRallyCry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      api.post<RallyCry>("/rcdo/rally-cries", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rallyCries"] }),
  });
}

export function useObjectives(rallyCryId: string) {
  return useQuery({
    queryKey: ["objectives", rallyCryId],
    queryFn: () => api.get<DefiningObjective[]>(`/rcdo/objectives?rallyCryId=${rallyCryId}`),
    enabled: !!rallyCryId,
  });
}

export function useCreateObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rallyCryId: string; title: string; description?: string }) =>
      api.post<DefiningObjective>("/rcdo/objectives", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["objectives"] });
      qc.invalidateQueries({ queryKey: ["rallyCries"] });
    },
  });
}

export function useOutcomes(objectiveId: string) {
  return useQuery({
    queryKey: ["outcomes", objectiveId],
    queryFn: () => api.get<Outcome[]>(`/rcdo/outcomes?definingObjectiveId=${objectiveId}`),
    enabled: !!objectiveId,
  });
}

export function useCreateOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { definingObjectiveId: string; title: string; description?: string }) =>
      api.post<Outcome>("/rcdo/outcomes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outcomes"] });
      qc.invalidateQueries({ queryKey: ["rallyCries"] });
    },
  });
}
