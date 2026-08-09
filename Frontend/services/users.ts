// Real endpoints (librarian-only): GET /api/users, GET /api/users/:id, GET /api/users/:id/history
import { apiClient } from "./api-client";
import { toLoan, type BackendLoan } from "./loans";
import { toBorrowRequest, type BackendBorrowRequest } from "./borrow-requests";
import { toCharge, type BackendCharge } from "./charges";
import type { Loan, BorrowRequest } from "@/types/loan";
import type { Charge } from "@/types/billing";
import type { User, UserRole } from "@/types/user";

interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "librarian" | "user";
  createdAt: string;
}

interface BackendUserHistory {
  loans: BackendLoan[];
  requests: BackendBorrowRequest[];
  charges: BackendCharge[];
}

function toRole(role: BackendUser["role"]): UserRole {
  return role === "librarian" ? "librarian" : "student";
}

function toUser(u: BackendUser): User {
  return { id: String(u.id), name: u.name, email: u.email, role: toRole(u.role), createdAt: u.createdAt };
}

export async function listUsers(filter?: { role?: UserRole; q?: string }): Promise<User[]> {
  const backendRole = filter?.role === "librarian" ? "librarian" : filter?.role === "student" ? "user" : undefined;
  const { data } = await apiClient.get<BackendUser[]>("/users", {
    params: { q: filter?.q, role: backendRole },
  });
  return data.map(toUser);
}

export async function getUser(id: string): Promise<User | undefined> {
  const { data } = await apiClient.get<BackendUser>(`/users/${id}`);
  return toUser(data);
}

export async function getUserHistory(
  id: string
): Promise<{ loans: Loan[]; requests: BorrowRequest[]; charges: Charge[] }> {
  const { data } = await apiClient.get<BackendUserHistory>(`/users/${id}/history`);
  return {
    loans: data.loans.map(toLoan),
    requests: data.requests.map(toBorrowRequest),
    charges: data.charges.map(toCharge),
  };
}
