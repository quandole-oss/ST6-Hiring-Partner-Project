import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { CommitItem } from "../types";

export function useCommitItemsByOutcome(outcomeId: string) {
  return useQuery({
    queryKey: ["commits", "by-outcome", outcomeId],
    queryFn: () => api.get<CommitItem[]>(`/commits/by-outcome/${outcomeId}`),
    enabled: !!outcomeId,
  });
}
