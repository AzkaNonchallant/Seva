import { apiRequest, apiRows } from "./api";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  Reimbursement,
  ReimbursementItem,
  TravelRequest,
} from "./types";

export type {
  Reimbursement,
  ReimbursementCategory,
  ReimbursementItem,
  ReimbursementStatus,
} from "./types";

/**
 * GET /api/reimbursements — paginated, and the rows arrive under `items`
 * rather than `data`. `apiList` normalises that difference.
 */
export function listReimbursements(params: { status?: string } = {}) {
  return apiRows<Reimbursement>("/api/reimbursements", { query: { ...params } });
}

/** GET /api/reimbursements/:id — the only read that includes `items`. */
export function getReimbursement(id: number) {
  return apiRequest<Reimbursement & { items: ReimbursementItem[] }>(
    `/api/reimbursements/${id}`,
  );
}

/** POST /api/reimbursements — the travel must be COMPLETED. */
export function createReimbursement(travelId: number) {
  return apiRequest<Reimbursement>("/api/reimbursements", {
    method: "POST",
    body: { travelId },
  });
}

/** POST /api/reimbursements/:id/items — while the header is still DRAFT. */
export function addReimbursementItem(
  id: number,
  /** Write shape: `amount` is a number here even though reads return a string. */
  payload: Pick<ReimbursementItem, "category" | "description" | "transactionDate"> & {
    amount: number;
    receiptPath?: string | null;
  },
) {
  return apiRequest<ReimbursementItem>(`/api/reimbursements/${id}/items`, {
    method: "POST",
    body: payload,
  });
}

/** DELETE /api/reimbursements/items/:itemId */
export function deleteReimbursementItem(itemId: number) {
  return apiRequest<{ deleted: number }>(`/api/reimbursements/items/${itemId}`, {
    method: "DELETE",
  });
}

/** POST /api/reimbursements/:id/submit — DRAFT → SUBMITTED. */
export function submitReimbursement(id: number) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/submit`, {
    method: "POST",
  });
}

/** PATCH /api/reimbursements/:id/verify — Finance only. */
export function verifyReimbursement(
  id: number,
  payload: { approvedAmount: number; status: "APPROVED" | "REJECTED"; note?: string },
) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/verify`, {
    method: "PATCH",
    body: payload,
  });
}

/** PATCH /api/reimbursements/:id/pay — Finance only. */
export function payReimbursement(id: number, externalJournalRef: string) {
  return apiRequest<Reimbursement>(`/api/reimbursements/${id}/pay`, {
    method: "PATCH",
    body: { externalJournalRef },
  });
}

/* ── Booking (§3) ──────────────────────────────────────────────────────── */

/** GET /api/travel/bookings/pending — the Admin Travel queue. */
export function listPendingBookings() {
  return apiRequest<PendingTravel[]>("/api/travel/bookings/pending");
}

/**
 * Row type of `GET /api/travel/bookings/pending`.
 *
 * API_SPEC §3 describes the endpoint as "travel APPROVED yang belum ada
 * booking" without publishing a body. The backend returns travel requests with
 * a nested `user`, so this is derived from the real shape rather than guessed.
 */
export type PendingTravel = TravelRequest;

/** GET /api/travel/:travelId/bookings */
export function listBookings(travelId: number) {
  return apiRequest<Booking[]>(`/api/travel/${travelId}/bookings`);
}

/** POST /api/travel/:travelId/bookings — only for an APPROVED travel. */
export function createBooking(travelId: number, payload: CreateBookingInput) {
  return apiRequest<Booking>(`/api/travel/${travelId}/bookings`, {
    method: "POST",
    body: payload,
  });
}

/** PATCH /api/travel/bookings/:id/status */
export function updateBookingStatus(id: number, status: BookingStatus) {
  return apiRequest<Booking>(`/api/travel/bookings/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}