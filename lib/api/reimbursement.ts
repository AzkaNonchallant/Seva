import { apiRequest } from "./api";
import type { TravelRequest } from "./types";

export type ReimbursementStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

export interface Reimbursement {
  id: number;
  travelId: number;
  travelRef?: string;
  employeeId: number;
  employeeName: string;
  departmentName?: string;
  totalAmount: number;
  advanceAmount: number;
  approvedAmount: number;
  differenceAmount: number;
  status: ReimbursementStatus;
  submittedAt?: string;
  paidAt?: string;
  externalJournalRef?: string;
}

export interface ReimbursementItem {
  id: number;
  category: "HOTEL" | "TRANSPORT" | "MEAL" | "TICKET" | "OTHER";
  description: string;
  amount: number;
  transactionDate: string;
  receiptPath?: string;
}

/** GET /api/reimbursements */
export function listReimbursements(status?: ReimbursementStatus) {
  return apiRequest<Reimbursement[]>("/api/reimbursements", {
    query: { status },
  });
}

/**
 * GET /api/reimbursements/:id
 *
 * Not part of the Admin Travel scope, but the Travel Admin needs the owning
 * travel request to decide how much of a trip has already been settled.
 */
export function getReimbursement(id: number) {
  return apiRequest<Reimbursement & { items: ReimbursementItem[] }>(
    `/api/reimbursements/${id}`,
  );
}

/** POST /api/reimbursements — requires the travel to be COMPLETED. */
export function createReimbursement(travelId: number) {
  return apiRequest<Reimbursement>("/api/reimbursements", {
    method: "POST",
    body: { travelId },
  });
}

export type { TravelRequest };
