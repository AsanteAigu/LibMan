// Real endpoints: GET/POST /api/borrow-requests, PATCH /api/borrow-requests/:id/approve|reject
import { apiClient } from "./api-client";
import type { BorrowRequest, BorrowRequestStatus } from "@/types/loan";

export interface BackendBorrowRequest {
  id: number;
  userId: number;
  userName: string;
  bookTitle: string | null;
  copyId: number | null;
  status: BorrowRequestStatus;
  rejectionReason: string | null;
  requestedAt: string;
  decidedAt: string | null;
  requestedDurationMinutes: number | null;
}

export function toBorrowRequest(r: BackendBorrowRequest): BorrowRequest {
  return {
    id: String(r.id),
    userId: String(r.userId),
    userName: r.userName,
    copyId: r.copyId != null ? String(r.copyId) : undefined,
    bookTitle: r.bookTitle ?? "",
    status: r.status,
    rejectionReason: r.rejectionReason ?? undefined,
    requestedAt: r.requestedAt,
    decidedAt: r.decidedAt ?? undefined,
    requestedDurationMinutes: r.requestedDurationMinutes ?? undefined,
  };
}

// The backend always scopes "mine" to the authenticated JWT, never a client-supplied
// userId -- students always get their own regardless of what's passed here.
export async function listBorrowRequests(filter?: {
  status?: BorrowRequestStatus;
  mine?: boolean;
}): Promise<BorrowRequest[]> {
  const { data } = await apiClient.get<BackendBorrowRequest[]>("/borrow-requests", {
    params: { status: filter?.status, mine: filter?.mine },
  });
  return data.map(toBorrowRequest);
}

export async function createBorrowRequest(titleId: string, durationMinutes: number): Promise<BorrowRequest> {
  const { data } = await apiClient.post<BackendBorrowRequest>("/borrow-requests", {
    titleId: Number(titleId),
    durationMinutes,
  });
  return toBorrowRequest(data);
}

export async function approveBorrowRequest(id: string): Promise<BorrowRequest> {
  const { data } = await apiClient.patch<BackendBorrowRequest>(`/borrow-requests/${id}/approve`);
  return toBorrowRequest(data);
}

export async function rejectBorrowRequest(id: string, reason: string): Promise<BorrowRequest> {
  const { data } = await apiClient.patch<BackendBorrowRequest>(`/borrow-requests/${id}/reject`, { reason });
  return toBorrowRequest(data);
}
