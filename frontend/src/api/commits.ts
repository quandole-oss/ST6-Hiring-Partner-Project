import { useQuery, useQueries, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  WeeklyCommit,
  CommitItem,
  CommitStatus,
  ChessCategory,
  Reconciliation,
  CreateCommitItemRequest,
  UpdateCommitItemRequest,
  UpdateReconciliationRequest,
  ItemFlag,
} from "../types";

function invalidateAll(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["commits"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCommits(teamMemberId: string) {
  return useQuery({
    queryKey: ["commits", teamMemberId],
    queryFn: () => api.get<WeeklyCommit[]>(`/commits?teamMemberId=${teamMemberId}`),
    enabled: !!teamMemberId,
  });
}

export function useCommit(id: string) {
  return useQuery({
    queryKey: ["commits", "detail", id],
    queryFn: () => api.get<WeeklyCommit>(`/commits/${id}`),
    enabled: !!id,
  });
}

export function useCreateCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { teamMemberId: string; weekStart: string }) =>
      api.post<WeeklyCommit>("/commits", data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCreateItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommitItemRequest) =>
      api.post<CommitItem>(`/commits/${commitId}/items`, data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; req: UpdateCommitItemRequest }) =>
      api.put<CommitItem>(`/commits/${commitId}/items/${data.itemId}`, data.req),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/commits/${commitId}/items/${itemId}`),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useLockCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/lock`, {}),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useStartReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/reconcile`, {}),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useSubmitReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/submit`, {}),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateItemFlag(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; riskFlag: ItemFlag; riskNote?: string }) =>
      api.put<CommitItem>(`/commits/${commitId}/items/${data.itemId}/risk`, { riskFlag: data.riskFlag, riskNote: data.riskNote }),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateItemCategory(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; chessCategory: ChessCategory }) =>
      api.patch<CommitItem>(`/commits/${commitId}/items/${data.itemId}/category`, {
        chessCategory: data.chessCategory,
      }),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: ["audit-log", commitId] });
    },
  });
}

export function useUpdateReconciliation(commitId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateReconciliationRequest) =>
      api.put<Reconciliation>(`/commits/${commitId}/items/${itemId}/reconciliation`, data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useOverrideCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; targetStatus: CommitStatus; notes: string }) =>
      api.post<WeeklyCommit>(`/commits/${data.id}/override`, {
        targetStatus: data.targetStatus,
        notes: data.notes,
      }),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateMood(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moodScore: number) =>
      api.put<WeeklyCommit>(`/commits/${commitId}/mood`, { moodScore }),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useTeamCommits(memberIds: string[], weekStart?: string) {
  const results = useQueries({
    queries: memberIds.map((id) => ({
      queryKey: ["commits", id, weekStart],
      queryFn: () => {
        const params = new URLSearchParams({ teamMemberId: id });
        if (weekStart) params.set("weekStart", weekStart);
        return api.get<WeeklyCommit[]>(`/commits?${params}`);
      },
      enabled: !!id,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const data = results
    .filter((r) => r.data)
    .flatMap((r) => r.data!);

  return { data: memberIds.length > 0 ? data : undefined, isLoading };
}
