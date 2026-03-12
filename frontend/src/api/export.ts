import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface ExportSettings {
  id: string | null;
  teamId: string;
  slackWebhookUrl: string | null;
  defaultEmailRecipients: string | null;
}

export interface EmailExportRequest {
  recipients: string[];
  attachPdf: boolean;
}

export interface ExportResult {
  success: boolean;
  message: string;
}

const BASE_URL = "/api/v1";
const STORAGE_KEY = "wc_auth";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (DEMO_MODE) return headers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function downloadPdf(teamId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/export/team/${teamId}/pdf`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to download PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weekly-commit-report.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useExportSettings(teamId: string) {
  return useQuery({
    queryKey: ["export-settings", teamId],
    queryFn: () => api.get<ExportSettings>(`/export/team/${teamId}/settings`),
    enabled: !!teamId,
  });
}

export function useUpdateExportSettings(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExportSettings) =>
      api.put<ExportSettings>(`/export/team/${teamId}/settings`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["export-settings", teamId] }),
  });
}

export function useSendEmail(teamId: string) {
  return useMutation({
    mutationFn: (data: EmailExportRequest) =>
      api.post<ExportResult>(`/export/team/${teamId}/email`, data),
  });
}
