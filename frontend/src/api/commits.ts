import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useCreateItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommitItemRequest) =>
      api.post<CommitItem>(`/commits/${commitId}/items`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useUpdateItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; req: UpdateCommitItemRequest }) =>
      api.put<CommitItem>(`/commits/${commitId}/items/${data.itemId}`, data.req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useDeleteItem(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/commits/${commitId}/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useLockCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/lock`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useStartReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/reconcile`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useSubmitReconciliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<WeeklyCommit>(`/commits/${id}/submit`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useUpdateItemFlag(commitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; riskFlag: ItemFlag; riskNote?: string }) =>
      api.put<CommitItem>(`/commits/${commitId}/items/${data.itemId}/risk`, { riskFlag: data.riskFlag, riskNote: data.riskNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
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
      qc.invalidateQueries({ queryKey: ["commits"] });
      qc.invalidateQueries({ queryKey: ["audit-log", commitId] });
    },
  });
}

export function useUpdateReconciliation(commitId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateReconciliationRequest) =>
      api.put<Reconciliation>(`/commits/${commitId}/items/${itemId}/reconciliation`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commits"] }),
  });
}

export function useTeamCommits(memberIds: string[]) {
  const results = useQueries({
    queries: memberIds.map((id) => ({
      queryKey: ["commits", id],
      queryFn: () => api.get<WeeklyCommit[]>(`/commits?teamMemberId=${id}`),
      enabled: !!id,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const data = results
    .filter((r) => r.data)
    .flatMap((r) => r.data!);

  return { data: memberIds.length > 0 ? data : undefined, isLoading };
}
