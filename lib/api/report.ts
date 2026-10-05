import { apiList, apiRequest, apiRows } from "./api";
import { listBookings } from "./reimbursement";
import { listTravels } from "./travel";

import type {
  Booking,
  BookingStatusBreakdown,
  ExpenseByDepartment,
  ExpenseByEmployee,
  ExpenseByProject,
  ReportDashboard,
  TravelRequest,
} from "./types";

/** GET /api/reports/dashboard — Admin, Super Admin. */
export function getDashboardReport() {
  return apiRequest<ReportDashboard>("/api/reports/dashboard");
}

/**
 * GET /api/reports/expense-by-department — Finance, Admin.
 *
 * The backend answers 403 for SUPER_ADMIN here, which matches API_SPEC §7
 * listing only "Finance, Admin", so these three calls stay in the Finance and
 * Admin areas.
 */
export function getExpenseByDepartment(period?: { from?: string; to?: string }) {
  return apiRequest<ExpenseByDepartment[]>("/api/reports/expense-by-department", {
    query: { from: period?.from, to: period?.to },
  });
}

export function getExpenseByEmployee(period?: { from?: string; to?: string }) {
  return apiRequest<ExpenseByEmployee[]>("/api/reports/expense-by-employee", {
    query: { from: period?.from, to: period?.to },
  });
}

export function getExpenseByProject(period?: { from?: string; to?: string }) {
  return apiRequest<ExpenseByProject[]>("/api/reports/expense-by-project", {
    query: { from: period?.from, to: period?.to },
  });
}

/* ── Cross-travel views, composed from published endpoints ─────────────── */

/** One travel request joined with the bookings that belong to it. */
export interface TravelWithBookings {
  travel: TravelRequest;
  bookings: Booking[];
}

/**
 * Loads every travel together with its bookings, using only endpoints the spec
 * publishes: `GET /api/travel` then `GET /api/travel/:travelId/bookings`.
 *
 * There is no aggregate booking report, so screens needing a cross-travel view
 * compose it here rather than inventing an endpoint. The cost is one extra
 * request per travel, and this is the single place to change if the backend
 * later publishes a report endpoint.
 */
export async function loadTravelsWithBookings(
  params: Parameters<typeof listTravels>[0] = {},
): Promise<TravelWithBookings[]> {
  const travels = await listTravels(params);
  return Promise.all(
    travels.map(async (travel) => ({
      travel,
      bookings: await listBookings(travel.id).catch(() => []),
    })),
  );
}

export interface BookingInsight extends Booking {
  travel: TravelRequest;
}

/** Every booking in scope, each carrying its parent travel request. */
export async function loadBookingsWithTravel(
  params: Parameters<typeof listTravels>[0] = {},
): Promise<BookingInsight[]> {
  const rows = await loadTravelsWithBookings(params);
  return rows.flatMap(({ travel, bookings }) =>
    bookings.map((booking) => ({ ...booking, travel })),
  );
}

const EMPTY_BREAKDOWN: BookingStatusBreakdown = {
  PENDING: 0,
  CONFIRMED: 0,
  CANCELLED: 0,
};

/**
 * A booking with the date the traveller actually leaves.
 *
 * The backend keeps a single `bookingDate` rather than the departure and
 * check-in pair the older spec described, so this is that one date.
 */
export interface DepartureRow extends Booking {
  travel: TravelRequest;
  departsOn: string;
  daysUntilDeparture: number;
}

function daysBetweenToday(day: string) {
  const target = new Date(`${day}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}

/**
 * Derives the status split, the realised booking value, and the departures
 * inside `windowDays` from an already-loaded set of bookings.
 */
export function summariseBookings(
  bookings: BookingInsight[],
  windowDays = 7,
): {
  breakdown: BookingStatusBreakdown;
  confirmedValue: number;
  total: number;
  departures: DepartureRow[];
} {
  const breakdown = { ...EMPTY_BREAKDOWN };
  let confirmedValue = 0;
  const departures: DepartureRow[] = [];

  for (const booking of bookings) {
    breakdown[booking.status] += 1;
    if (booking.status === "CONFIRMED") confirmedValue += Number(booking.amount);

    // A cancelled booking is not a departure worth watching.
    if (booking.status === "CANCELLED") continue;
    if (!booking.bookingDate) continue;

    const daysUntilDeparture = daysBetweenToday(booking.bookingDate);
    if (daysUntilDeparture < 0 || daysUntilDeparture > windowDays) continue;

    departures.push({ ...booking, departsOn: booking.bookingDate, daysUntilDeparture });
  }

  departures.sort((a, b) => a.daysUntilDeparture - b.daysUntilDeparture);

  return { breakdown, confirmedValue, total: bookings.length, departures };
}

/**
 * Everything the Admin Travel dashboard needs in one pass: the status split,
 * the realised booking value, and the departures in the next `windowDays`.
 */
export async function getBookingOverview(windowDays = 7) {
  return summariseBookings(await loadBookingsWithTravel(), windowDays);
}

export { apiList, apiRows };