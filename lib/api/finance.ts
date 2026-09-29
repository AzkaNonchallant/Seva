import { apiRequest } from "./api";
import type { Reimbursement } from "./reimbursement";

/**
 * Finance-side actions on reimbursements.
 *
 * Outside the Admin Travel scope, kept in its own module so the role split in
 * API_SPEC §8 stays visible: FINANCE verifies and pays, ADMIN books travel.
 */

/** PATCH /api/reimbursements/:id/verify */
export function verifyReimbursement(
  id: number,
  payload: { approvedAmount: number; status: "APPROVED" | "REJECTED"; note?: string },
) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/verify`, {
    method: "PATCH",
    body: payload,
  });
}

/** PATCH /api/reimbursements/:id/pay */
export function payReimbursement(id: number, externalJournalRef: string) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/pay`, {
    method: "PATCH",
    body: { externalJournalRef },
  });
}
