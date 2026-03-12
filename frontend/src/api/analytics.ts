import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { PersonalAnalytics } from "../types";

export function usePersonalAnalytics(memberId: string) {
  return useQuery({
    queryKey: ["analytics", "personal", memberId],
    queryFn: () => api.get<PersonalAnalytics>(`/analytics/personal/${memberId}`),
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
  });
}
