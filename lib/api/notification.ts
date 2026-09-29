import { apiRequest } from "./api";
import type { Notification } from "./types";

/** GET /api/notifications?isRead= */
export function listNotifications(isRead?: boolean) {
  return apiRequest<Notification[]>("/api/notifications", {
    query: { isRead },
  });
}

/** GET /api/notifications/unread-count */
export function getUnreadCount() {
  return apiRequest<{ count: number }>("/api/notifications/unread-count");
}

/** PATCH /api/notifications/:id/read */
export function markAsRead(id: number) {
  return apiRequest<Notification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

/** PATCH /api/notifications/read-all */
export function markAllAsRead() {
  return apiRequest<{ updated: number }>("/api/notifications/read-all", {
    method: "PATCH",
  });
}
