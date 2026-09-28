import "server-only";

import { randomUUID } from "node:crypto";

import {
  mockApprovals,
  mockBookings,
  mockNotifications,
  mockPolicies,
  mockPendingTravels,
  mockTravels,
  mockUsers,
} from "./db";

import { getSessionUser } from "@/lib/api/api";
import { ApiError, STATUS_TO_CODE } from "@/lib/api/errors";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  TravelRequest,
  User,
} from "@/lib/api/types";

/**
 * Mock transport.
 *
 * Paths and methods mirror API_SPEC.md exactly, and every handler returns the
 * `{ success, data }` / `{ success, message }` envelope. Pointing the app at a
 * real backend means setting NEXT_PUBLIC_API_BASE_URL — `apiRequest` then skips
 * this file and the service layer is unchanged.
 */

interface MockRequest {
  method: string;
  path: string;
  body?: unknown;
  hasAuth: boolean;
}

type Handler = (req: MockRequest, url: URL) => unknown | Promise<unknown>;

const ok = <T,>(data: T) => ({ success: true as const, data });

/** Simulated latency so loading states are actually exercised in dev. */
const LATENCY_MS = 140;

async function assertAuthenticated() {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(
      "UNAUTHORIZED",
      "Sesi berakhir. Silakan masuk kembali.",
      401,
    );
  }
  return user;
}

async function assertBookingAdmin() {
  const user = await assertAuthenticated();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya Admin Travel yang dapat mengelola booking.",
      403,
    );
  }
  return user;
}

/**
 * Failure envelope carrying the HTTP status the real backend would return.
 * `handleMockRequest` maps it through STATUS_TO_CODE, so mock mode produces
 * the same `ApiError.code` as the live path — otherwise a 404 would surface
 * as BAD_REQUEST here and any `isNotFound` branch would differ in production.
 */
const fail = (message: string, status: number) => ({
  success: false as const,
  message,
  status,
});

const notFound = (message: string) => fail(message, 404);
const badRequest = (message: string) => fail(message, 400);

/* ── Handlers, grouped by API_SPEC section ───────────────────────────── */

const handlers: Array<[string, RegExp, Handler]> = [
  // §1 Auth
  [
    "POST",
    /^\/api\/auth\/login$/,
    async (req) => {
      const { email, password: secret } = (req.body ?? {}) as {
        email?: string;
        password?: string;
      };
      if (!email || !secret) {
        return badRequest("Email dan password wajib diisi.");
      }

      const user = mockUsers.find(
        (candidate) =>
          candidate.email.toLowerCase() === email.trim().toLowerCase(),
      );
      // One message for both cases so the form cannot be used to discover
      // which email addresses exist.
      if (!user || user.password !== secret) {
        return badRequest("Email atau password salah.");
      }
      if (!user.isActive) {
        return badRequest("Akun dinonaktifkan. Hubungi Super Admin.");
      }

      // API_SPEC's login response has no password field, so it is dropped here
      // rather than sent and hidden client-side.
      const safe: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        positionId: user.positionId,
        positionName: user.positionName,
        isActive: user.isActive,
      };
      return {
        success: true as const,
        data: {
          user: safe satisfies User,
          token: `mock.${Buffer.from(user.email).toString("base64url")}.${randomUUID()}`,
        },
      };
    },
  ],
  [
    "GET",
    /^\/api\/auth\/me$/,
    async () => ok(await assertAuthenticated()),
  ],

  // §3 Travel — policies
  [
    "GET",
    /^\/api\/travel\/policies\/applicable$/,
    async (_req, url) => {
      const tier = url.searchParams.get("destinationTier");
      return ok(
        mockPolicies.filter(
          (policy) =>
            policy.isActive &&
            (!tier ||
              policy.destinationTier === tier ||
              policy.destinationTier === "ANY"),
        ),
      );
    },
  ],
  [
    "GET",
    /^\/api\/travel\/policies$/,
    async () => ok(mockPolicies.filter((policy) => policy.isActive)),
  ],

  // §3 Bookings — the ADMIN sub-resource
  [
    "GET",
    /^\/api\/travel\/bookings\/pending$/,
    async () => {
      await assertBookingAdmin();
      return ok(mockPendingTravels);
    },
  ],
  [
    "PATCH",
    /^\/api\/travel\/bookings\/(\d+)\/status$/,
    async (req, url) => {
      await assertBookingAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const { status } = (req.body ?? {}) as { status?: BookingStatus };

      const allowed: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED"];
      if (!status || !allowed.includes(status)) {
        return badRequest(
          `Status tidak valid. Pilihan: ${allowed.join(", ")}.`,
        );
      }

      const booking = mockBookings.find((candidate) => candidate.id === id);
      if (!booking) return notFound("Booking tidak ditemukan.");

      booking.status = status;
      booking.updatedAt = new Date().toISOString();
      return ok(booking);
    },
  ],
  [
    "GET",
    /^\/api\/travel\/(\d+)\/bookings$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      return ok(mockBookings.filter((b) => b.travelId === travelId));
    },
  ],
  [
    "POST",
    /^\/api\/travel\/(\d+)\/bookings$/,
    async (req, url) => {
      await assertBookingAdmin();
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);

      if (!travel) return notFound("Travel request tidak ditemukan.");
      // Explicit rule in API_SPEC: booking requires an APPROVED travel.
      if (travel.status !== "APPROVED") {
        return badRequest(
          `Booking hanya dapat dibuat untuk travel berstatus APPROVED. Status saat ini: ${travel.status}.`,
        );
      }

      const payload = (req.body ?? {}) as Partial<CreateBookingInput>;
      const fields: Record<string, string> = {};
      if (!payload.type) fields.type = "Jenis booking wajib dipilih.";
      if (!payload.amount || payload.amount <= 0) {
        fields.amount = "Nilai booking harus lebih dari 0.";
      }
      if (Object.keys(fields).length) {
        throw new ApiError(
          "VALIDATION",
          "Data booking belum lengkap.",
          422,
          fields,
        );
      }

      const now = new Date().toISOString();
      const booking: Booking = {
        id: Date.now(),
        travelId,
        travelRef: travel.ref,
        type: payload.type!,
        provider: payload.provider,
        referenceNumber: payload.referenceNumber,
        origin: payload.origin,
        destination: payload.destination ?? travel.destination,
        departureDate: payload.departureDate,
        returnDate: payload.returnDate,
        checkInDate: payload.checkInDate,
        checkOutDate: payload.checkOutDate,
        amount: payload.amount!,
        status: "PENDING",
        notes: payload.notes,
        createdAt: now,
        updatedAt: now,
      };
      mockBookings.unshift(booking);

      // Leaves the queue the moment it gains its first booking.
      const queueIndex = mockPendingTravels.findIndex((t) => t.id === travelId);
      if (queueIndex >= 0) mockPendingTravels.splice(queueIndex, 1);

      return ok(booking);
    },
  ],
  [
    "GET",
    /^\/api\/travel\/(\d+)\/documents$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      return ok([
        {
          id: travelId * 10,
          travelId,
          fileName: "undangan-klien.pdf",
          filePath: `uploads/documents/tr-${travelId}/undangan-klien.pdf`,
          mimeType: "application/pdf",
          size: 284_120,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    },
  ],
  [
    "GET",
    /^\/api\/travel\/(\d+)$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      return ok({
        ...travel,
        approvals: mockApprovals[travelId] ?? [],
        bookings: mockBookings.filter((b) => b.travelId === travelId),
      });
    },
  ],
  [
    "GET",
    /^\/api\/travel$/,
    async (_req, url) => {
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search")?.toLowerCase();

      let rows = [...mockTravels];
      if (status) rows = rows.filter((t) => t.status === status);
      if (search) {
        rows = rows.filter((t) =>
          [t.ref, t.employeeName, t.destination, t.purpose]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(search as string),
            ),
        );
      }
      return ok(rows.sort((a, b) => b.id - a.id));
    },
  ],

  // §4 Approval — timeline
  [
    "GET",
    /^\/api\/approvals\/travel\/(\d+)$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      return ok(mockApprovals[travelId] ?? []);
    },
  ],

  // §6 Notification
  [
    "GET",
    /^\/api\/notifications\/unread-count$/,
    async () =>
      ok({ count: mockNotifications.filter((n) => !n.isRead).length }),
  ],
  [
    "GET",
    /^\/api\/notifications$/,
    async (_req, url) => {
      const isRead = url.searchParams.get("isRead");
      let rows = [...mockNotifications];
      if (isRead === "true") rows = rows.filter((n) => n.isRead);
      if (isRead === "false") rows = rows.filter((n) => !n.isRead);
      return ok(rows);
    },
  ],
  [
    "PATCH",
    /^\/api\/notifications\/read-all$/,
    async () => {
      mockNotifications.forEach((n) => {
        n.isRead = true;
      });
      return ok({ updated: mockNotifications.length });
    },
  ],
  [
    "PATCH",
    /^\/api\/notifications\/(\d+)\/read$/,
    async (_req, url) => {
      const id = Number(url.pathname.split("/")[3]);
      const notification = mockNotifications.find((n) => n.id === id);
      if (!notification) return notFound("Notifikasi tidak ditemukan.");
      notification.isRead = true;
      return ok(notification);
    },
  ],

  // §7 Reporting
  [
    "GET",
    /^\/api\/reports\/dashboard$/,
    async () => {
      const today = new Date().toISOString().slice(0, 10);
      const approved = mockTravels.filter((t) => t.status === "APPROVED");
      return ok({
        ongoing: approved.filter(
          (t) => t.startDate <= today && t.endDate >= today,
        ).length,
        upcoming: approved.filter((t) => t.startDate > today).length,
        completed: mockTravels.filter((t) => t.status === "COMPLETED").length,
        total: mockTravels.length,
      });
    },
  ],
  [
    "GET",
    /^\/api\/reports\/expense-by-department$/,
    async () => ok(confirmedTotals((travel) => travel.departmentName, "department")),
  ],
  [
    "GET",
    /^\/api\/reports\/expense-by-employee$/,
    async () => ok(confirmedTotals((travel) => travel.employeeName, "employee")),
  ],
  [
    "GET",
    /^\/api\/reports\/expense-by-project$/,
    async () => ok(confirmedTotals((travel) => travel.purpose, "project")),
  ],
];

/**
 * Spending rollup over CONFIRMED bookings, grouped by whatever the spec keys
 * each report on. Cancelled and still-pending bookings are excluded: only
 * money actually committed counts as realised expense.
 */
function confirmedTotals(
  keyOf: (travel: TravelRequest) => string | undefined,
  field: "department" | "employee" | "project",
) {
  const totals = new Map<string, number>();
  for (const booking of mockBookings) {
    if (booking.status !== "CONFIRMED") continue;
    const travel = mockTravels.find((t) => t.id === booking.travelId);
    const key = keyOf(travel!) || "Tidak diketahui";
    totals.set(key, (totals.get(key) ?? 0) + booking.amount);
  }
  return [...totals.entries()]
    .map(([name, total]) => ({ [field]: name, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Longest pattern first so `/api/travel/bookings/pending` is matched before the
 * broader `/api/travel/:id/bookings` shape can shadow it.
 */
const sortedHandlers = [...handlers].sort(
  (a, b) => b[1].source.length - a[1].source.length,
);

export async function handleMockRequest<T>(req: MockRequest): Promise<T> {
  const url = new URL(req.path, "http://localhost");

  for (const [method, pattern, handler] of sortedHandlers) {
    if (method !== req.method) continue;
    if (!pattern.test(url.pathname)) continue;

    if (req.hasAuth) assertAuthenticated();

    const envelope = await handler(req, url);
    if (LATENCY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    }

    if (!envelope || typeof envelope !== "object" || !("success" in envelope)) {
      throw new ApiError("SERVER", "Mock mengembalikan payload tak terduga.", 500);
    }
    const result = envelope as {
      success: boolean;
      data?: T;
      message?: string;
      status?: number;
    };
    if (!result.success) {
      const status = (result as { status?: number }).status ?? 400;
      throw new ApiError(
        STATUS_TO_CODE[status] ?? "UNKNOWN",
        result.message ?? "Permintaan ditolak.",
        status,
      );
    }
    return result.data as T;
  }

  throw new ApiError(
    "NOT_FOUND",
    `Endpoint belum tersedia di mock: ${req.method} ${url.pathname}`,
    404,
  );
}
