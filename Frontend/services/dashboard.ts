// Real endpoints: GET /api/dashboard/student|librarian
import { apiClient } from "./api-client";
import type { LibrarianDashboardStats, StudentDashboardStats } from "@/types/dashboard";

// Both scoped to the authenticated user's own role via the JWT.
export async function getStudentStats(): Promise<StudentDashboardStats> {
  const { data } = await apiClient.get<StudentDashboardStats>("/dashboard/student");
  return data;
}

export async function getLibrarianStats(): Promise<LibrarianDashboardStats> {
  const { data } = await apiClient.get<LibrarianDashboardStats>("/dashboard/librarian");
  return data;
}
