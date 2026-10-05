/**
 * Re-export of the booking calls, which now live beside the other §3 booking
 * and §5 reimbursement services in `reimbursement.ts`. Kept as its own module so
 * the import path stays stable.
 */
export {
  createBooking,
  listBookings,
  listPendingBookings,
  updateBookingStatus,
} from "./reimbursement";

export type { PendingTravel } from "./reimbursement";
export type {
  Booking,
  BookingStatus,
  BookingType,
  CreateBookingInput,
} from "./types";