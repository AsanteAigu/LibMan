// Real endpoints: GET/POST /api/reservations, PATCH /api/reservations/:id/cancel
import { apiClient } from "./api-client";
import type { Reservation, ReservationStatus } from "@/types/loan";

interface BackendReservation {
  id: number;
  titleId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  queuePosition: number;
  status: ReservationStatus;
  notifiedAt: string | null;
  windowExpiresAt: string | null;
  createdAt: string;
}

function toReservation(r: BackendReservation): Reservation {
  return {
    id: String(r.id),
    titleId: String(r.titleId),
    bookTitle: r.bookTitle,
    userId: String(r.userId),
    userName: r.userName,
    queuePosition: r.queuePosition,
    status: r.status,
    notifiedAt: r.notifiedAt ?? undefined,
    windowExpiresAt: r.windowExpiresAt ?? undefined,
    createdAt: r.createdAt,
  };
}

export async function listReservations(filter?: { mine?: boolean }): Promise<Reservation[]> {
  const { data } = await apiClient.get<BackendReservation[]>("/reservations", {
    params: { mine: filter?.mine },
  });
  return data.map(toReservation);
}

export async function createReservation(titleId: string): Promise<Reservation> {
  const { data } = await apiClient.post<BackendReservation>("/reservations", {
    titleId: Number(titleId),
  });
  return toReservation(data);
}

export async function cancelReservation(id: string): Promise<Reservation> {
  const { data } = await apiClient.patch<BackendReservation>(`/reservations/${id}/cancel`);
  return toReservation(data);
}
