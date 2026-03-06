import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { AuditLogEntry } from "../types";

export function useAuditLog(commitId: string) {
  return useQuery({
    queryKey: ["audit-log", commitId],
    queryFn: () => api.get<AuditLogEntry[]>(`/commits/${commitId}/audit-log`),
    enabled: !!commitId,
  });
}
