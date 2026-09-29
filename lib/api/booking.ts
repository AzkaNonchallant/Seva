import { apiRequest } from "./api";
import type { Booking, BookingStatus, CreateBookingInput } from "./types";

import type { PendingBookingTravel } from "@/lib/mocks/db";

/**
 * Row type of GET /api/travel/bookings/pending.
 *
 * API_SPEC describes the endpoint as "dashboard: travel APPROVED yang belum
 * ada booking" without publishing a body, so the mock returns a denormalised
 * view. If the real backend keeps `GET /api/travel/` narrow instead, the
 * service can compose the queue client-side — the UI only needs this shape.
 */
export type PendingTravel = PendingBookingTravel;

/** GET /api/travel/bookings/pending — Admin Travel dashboard queue. */
export function listPendingBookings() {
  return apiRequest<PendingTravel[]>("/api/travel/bookings/pending");
}

/** GET /api/travel/:travelId/bookings */
export function listBookings(travelId: number) {
  return apiRequest<Booking[]>(`/api/travel/${travelId}/bookings`);
}

/**
 * POST /api/travel/:travelId/bookings
 * The backend rejects this unless the travel request is APPROVED, so the UI
 * only offers the action on rows that satisfy that.
 */
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
