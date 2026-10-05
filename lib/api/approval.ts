import { apiList, apiRequest, apiRows } from "./api";
import type { Approval, Delegation, Notification, Page } from "./types";

/** GET /api/approvals/pending — paginated, and only for an approver role. */
export function listPendingApprovals(params: { page?: number; limit?: number } = {}) {
  return apiRows<Approval>("/api/approvals/pending", { query: { ...params } });
}

/** GET /api/approvals/travel/:travelId — the timeline for one request. */
export function getApprovalTimeline(travelId: number) {
  return apiRequest<Approval[]>(`/api/approvals/travel/${travelId}`);
}

/** PATCH /api/approvals/:id/decision */
export function decideApproval(
  id: number,
  status: "APPROVED" | "REJECTED",
  note?: string,
) {
  return apiRequest<Approval>(`/api/approvals/${id}/decision`, {
    method: "PATCH",
    body: { status, note },
  });
}

/** GET /api/approvals/delegations — given or received. */
export function listDelegations() {
  return apiRequest<Delegation[]>("/api/approvals/delegations");
}

/** POST /api/approvals/delegations */
export function createDelegation(payload: {
  delegateId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  return apiRequest<Delegation>("/api/approvals/delegations", {
    method: "POST",
    body: payload,
  });
}

/** DELETE /api/approvals/delegations/:id */
export function deleteDelegation(id: number) {
  return apiRequest<{ deleted: number }>(`/api/approvals/delegations/${id}`, { method: "DELETE" });
}

/* ── Notifications (§6) ─────────────────────────────────────────────────── */

/** GET /api/notifications?isRead= — paginated. */
export function listNotifications(params: { isRead?: boolean } = {}) {
  return apiRows<Notification>("/api/notifications", { query: { ...params } });
}

/** GET /api/notifications/unread-count */
export function getUnreadCount() {
  return apiRequest<{ count: number }>("/api/notifications/unread-count");
}

/** PATCH /api/notifications/:id/read */
export function markAsRead(id: number) {
  return apiRequest<Notification>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

/** PATCH /api/notifications/read-all */
export function markAllAsRead() {
  return apiRequest<{ deleted: number }>("/api/notifications/read-all", { method: "PATCH" });
}

export type { Page };