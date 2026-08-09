// Real endpoints: GET /api/loans, PATCH /api/loans/:id/collect|return|extend
import { apiClient } from "./api-client";
import type { Loan, LoanState, ReturnCondition } from "@/types/loan";

export interface BackendLoan {
  id: number;
  borrowRequestId: number | null;
  copyId: number;
  userId: number;
  userName: string;
  bookTitle: string;
  shelfLocation: string | null;
  holdStartedAt: string | null;
  holdExpiresAt: string | null;
  collectedAt: string | null;
  dueDate: string | null;
  returnedAt: string | null;
  returnCondition: ReturnCondition | null;
  extended: boolean;
  extendedDueDate: string | null;
  loanState: LoanState;
  requestedDurationMinutes: number | null;
}

export function toLoan(l: BackendLoan): Loan {
  return {
    id: String(l.id),
    borrowRequestId: l.borrowRequestId != null ? String(l.borrowRequestId) : undefined,
    copyId: String(l.copyId),
    userId: String(l.userId),
    userName: l.userName,
    bookTitle: l.bookTitle,
    shelfLocation: l.shelfLocation ?? undefined,
    holdStartedAt: l.holdStartedAt ?? "",
    holdExpiresAt: l.holdExpiresAt ?? undefined,
    collectedAt: l.collectedAt ?? undefined,
    dueDate: l.dueDate ?? undefined,
    returnedAt: l.returnedAt ?? undefined,
    returnCondition: l.returnCondition ?? undefined,
    extended: l.extended,
    extendedDueDate: l.extendedDueDate ?? undefined,
    loanState: l.loanState,
    requestedDurationMinutes: l.requestedDurationMinutes ?? undefined,
  };
}

// mine=false (the default, for a librarian token) returns every active loan;
// a student token always gets only their own regardless of this flag.
export async function listLoans(filter?: { mine?: boolean }): Promise<Loan[]> {
  const { data } = await apiClient.get<BackendLoan[]>("/loans", { params: { mine: filter?.mine } });
  return data.map(toLoan);
}

export async function collectLoan(id: string): Promise<Loan> {
  const { data } = await apiClient.patch<BackendLoan>(`/loans/${id}/collect`);
  return toLoan(data);
}

export async function returnLoan(id: string, condition: ReturnCondition): Promise<Loan> {
  const { data } = await apiClient.patch<BackendLoan>(`/loans/${id}/return`, { condition });
  return toLoan(data);
}

export async function extendLoan(id: string): Promise<Loan> {
  const { data } = await apiClient.patch<BackendLoan>(`/loans/${id}/extend`);
  return toLoan(data);
}
