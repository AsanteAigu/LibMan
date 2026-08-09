// Real endpoints: GET /api/notifications, PATCH /api/notifications/:id/read
import { apiClient } from "./api-client";
import type { Notification } from "@/types/notification";

interface BackendNotification {
  id: number;
  userId: number;
  type: string;
  referenceId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
}

function toNotification(n: BackendNotification): Notification {
  return {
    id: String(n.id),
    userId: String(n.userId),
    type: n.type,
    referenceId: n.referenceId != null ? String(n.referenceId) : undefined,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt,
  };
}

// Always the authenticated user's own notifications.
export async function listNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<BackendNotification[]>("/notifications");
  return data.map(toNotification);
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<BackendNotification>(`/notifications/${id}/read`);
  return toNotification(data);
}
