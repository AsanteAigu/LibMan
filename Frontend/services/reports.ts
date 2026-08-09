// Real endpoints (librarian-only): GET /api/reports, GET/PATCH /api/settings
import { apiClient } from "./api-client";
import type { Report, Setting } from "@/types/report";

export async function listReports(): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>("/reports");
  return data;
}

export async function listSettings(): Promise<Setting[]> {
  const { data } = await apiClient.get<Setting[]>("/settings");
  return data;
}

export async function updateSetting(key: string, value: string): Promise<Setting> {
  const { data } = await apiClient.patch<Setting>(`/settings/${key}`, { value });
  return data;
}
