import type { Booking, TravelRequest } from "@/lib/api/types";

/**
 * Read helpers for the two entities whose shape differs most from API_SPEC.
 *
 * The backend nests travel ownership as `user` and does not mint a request
 * `ref`, and it stores a booking's date as a single `bookingDate` with a
 * `bookingCode` for the confirmation number. Screens read these through here so
 * the difference is described once.
 */

/** A stable human label for a request — the backend has no `ref` field. */
export function travelLabel(travel: Pick<TravelRequest, "id" | "destination">) {
  return travel.destination;
}

export function travelOwner(travel: Pick<TravelRequest, "user">) {
  return travel.user?.name ?? "—";
}

export function travelOwnerEmail(travel: Pick<TravelRequest, "user">) {
  return travel.user?.email ?? "—";
}

/** The date a booking takes effect, whatever kind of booking it is. */
export function bookingDate(booking: Pick<Booking, "bookingDate">) {
  return booking.bookingDate ?? null;
}

export function bookingCode(booking: Pick<Booking, "bookingCode">) {
  return booking.bookingCode ?? null;
}

const BOOKING_TYPE_LABEL: Record<Booking["type"], string> = {
  FLIGHT: "Penerbangan",
  HOTEL: "Hotel",
  TRAIN: "Kereta Api",
  TRANSPORT: "Transportasi Darat",
};

export function bookingTypeLabel(type: Booking["type"]) {
  return BOOKING_TYPE_LABEL[type] ?? type;
}