import { apiRequest } from "./api";
import type { Approval, Delegation } from "./types";

/** GET /api/approvals/pending — approvals waiting on the logged-in user. */
export function listPendingApprovals() {
  return apiRequest<Approval[]>("/api/approvals/pending");
}

/** GET /api/approvals/travel/:travelId — full timeline for one request. */
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

/** GET /api/approvals/delegations */
export function listDelegations() {
  return apiRequest<Delegation[]>("/api/approvals/delegations");
}
