import { apiRequest } from "./api";
import { listBookings } from "./booking";
import { listTravels } from "./travel";

import type {
  Booking,
  BookingStatusBreakdown,
  ReportDashboard,
  TravelRequest,
} from "./types";

/** GET /api/reports/dashboard — Admin, Super Admin. */
export function getDashboardReport() {
  return apiRequest<ReportDashboard>("/api/reports/dashboard");
}

/** GET /api/reports/expense-by-department */
export function getExpenseByDepartment(period?: { from?: string; to?: string }) {
  return apiRequest<Array<{ department: string; total: number }>>(
    "/api/reports/expense-by-department",
    { query: { from: period?.from, to: period?.to } },
  );
}

/** GET /api/reports/expense-by-employee */
export function getExpenseByEmployee(period?: { from?: string; to?: string }) {
  return apiRequest<Array<{ employee: string; total: number }>>(
    "/api/reports/expense-by-employee",
    { query: { from: period?.from, to: period?.to } },
  );
}

/** GET /api/reports/expense-by-project */
export function getExpenseByProject(period?: { from?: string; to?: string }) {
  return apiRequest<Array<{ project: string; total: number }>>(
    "/api/reports/expense-by-project",
    { query: { from: period?.from, to: period?.to } },
  );
}

/** One travel request joined with the bookings that belong to it. */
export interface TravelWithBookings {
  travel: TravelRequest;
  bookings: Booking[];
}

/**
 * Loads every travel together with its bookings, using only endpoints the
 * spec publishes: `GET /api/travel` then `GET /api/travel/:travelId/bookings`.
 *
 * The spec has no aggregate booking report, so screens that need a cross-travel
 * view (dashboard status split, departure monitor, realised booking value)
 * compose it here rather than inventing an endpoint. The cost is N+1 requests —
 * acceptable here, and the single place to change if the backend later adds a
 * report endpoint to replace it.
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

export interface DepartureRow extends Booking {
  travel: TravelRequest;
  /** The date the traveller actually leaves — flight or hotel check-in. */
  departsOn: string;
  daysUntilDeparture: number;
}

/**
 * Derives the status split, the realised booking value, and the departures
 * inside `windowDays` from an already-loaded set of bookings.
 *
 * Split out from the fetch so a screen that has the rows in hand — the booking
 * list, for instance — summarises them without a second N+1 pass.
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
    if (booking.status === "CONFIRMED") confirmedValue += booking.amount;

    // A cancelled booking is not a departure worth watching.
    if (booking.status === "CANCELLED") continue;

    const departsOn = booking.departureDate ?? booking.checkInDate;
    if (!departsOn) continue;

    const daysUntilDeparture = daysBetweenToday(departsOn);
    if (daysUntilDeparture < 0 || daysUntilDeparture > windowDays) continue;

    departures.push({ ...booking, departsOn, daysUntilDeparture });
  }

  departures.sort((a, b) => a.daysUntilDeparture - b.daysUntilDeparture);

  return { breakdown, confirmedValue, total: bookings.length, departures };
}

/**
 * Everything the Admin Travel dashboard needs in one pass: the status split,
 * the realised booking value, and the departures in the next `windowDays`.
 *
 * Still built from spec endpoints only (see `loadBookingsWithTravel`), so the
 * dashboard costs one extra round trip per travel rather than an invented
 * aggregate report.
 */
export async function getBookingOverview(windowDays = 7) {
  return summariseBookings(await loadBookingsWithTravel(), windowDays);
}

function daysBetweenToday(day: string) {
  const target = new Date(`${day}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}
