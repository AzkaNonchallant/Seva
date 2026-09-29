import { apiRequest } from "./api";
import type { Reimbursement, ReimbursementItem } from "./types";

export type {
  Reimbursement,
  ReimbursementItem,
  ReimbursementStatus,
} from "./types";

/** GET /api/reimbursements — own rows for Employee, all rows for Finance. */
export function listReimbursements(status?: string) {
  return apiRequest<Reimbursement[]>("/api/reimbursements", {
    query: { status },
  });
}

/** GET /api/reimbursements/:id */
export function getReimbursement(id: number) {
  return apiRequest<Reimbursement & { items: ReimbursementItem[] }>(
    `/api/reimbursements/${id}`,
  );
}

/** POST /api/reimbursements — only for an owner whose travel is COMPLETED. */
export function createReimbursement(travelId: number) {
  return apiRequest<Reimbursement>("/api/reimbursements", {
    method: "POST",
    body: { travelId },
  });
}

/** POST /api/reimbursements/:id/items — while the header is still DRAFT. */
export function addReimbursementItem(
  id: number,
  payload: Omit<ReimbursementItem, "id">,
) {
  return apiRequest<ReimbursementItem>(`/api/reimbursements/${id}/items`, {
    method: "POST",
    body: payload,
  });
}

/** DELETE /api/reimbursements/items/:itemId */
export function deleteReimbursementItem(id: number, itemId: number) {
  return apiRequest<{ deleted: number }>(`/api/reimbursements/items/${itemId}`, {
    method: "DELETE",
    query: { reimbursementId: id },
  });
}

/** POST /api/reimbursements/:id/submit — DRAFT → SUBMITTED. */
export function submitReimbursement(id: number) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/submit`, {
    method: "POST",
  });
}
