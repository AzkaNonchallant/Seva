import "server-only";

import { randomUUID } from "node:crypto";

import {
  mockApprovals,
  mockBookings,
  mockDelegations,
  mockDepartments,
  mockNotifications,
  mockPolicies,
  mockPendingTravels,
  mockPositions,
  mockReimbursements,
  mockTravels,
  mockUsers,
} from "./db";

import { getSessionUser } from "@/lib/api/api";
import { ApiError, STATUS_TO_CODE } from "@/lib/api/errors";
import type {
  Approval,
  Booking,
  BookingStatus,
  CreateBookingInput,
  Department,
  Position,
  ReimbursementItem,
  ReimbursementStatus,
  Role,
  TravelPolicy,
  TravelRequest,
  User,
} from "@/lib/api/types";

/** §8 role matrix, restated so the mock enforces the same split as the spec. */
const SUPER_ADMIN_ROLES: Role[] = [
  "EMPLOYEE",
  "MANAGER",
  "DEPARTMENT_HEAD",
  "HRD",
  "FINANCE",
  "ADMIN",
  "SUPER_ADMIN",
];

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

/** §2 master-data mutations are Super Admin only. */
async function assertSuperAdmin() {
  const user = await assertAuthenticated();
  if (user.role !== "SUPER_ADMIN") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya Super Admin yang dapat mengelola master data.",
      403,
    );
  }
  return user;
}

/** §3 travel drafts belong to their owner. */
async function assertOwner(owner: { employeeId: number }) {
  const user = await assertAuthenticated();
  if (owner.employeeId !== user.id) {
    throw new ApiError(
      "FORBIDDEN",
      "Pengajuan ini bukan milik Anda.",
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

/**
 * Monotonic ids for rows created through the mock during a dev session. Seed
 * data tops out well below this, so generated ids never collide with a fixture.
 */
const FIRST_GENERATED_ID = 9000;

function nextId(rows: Array<{ id: number }>) {
  const highest = rows.reduce((max, row) => Math.max(max, row.id), 0);
  return Math.max(highest, FIRST_GENERATED_ID) + 1;
}

/**
 * The login response has no password field, so the directory omits it too.
 * Built by explicit assignment rather than by destructuring the password away,
 * which keeps every field of `User` visible here.
 */
function publicUser(user: (typeof mockUsers)[number]): User {
  return {
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
}

/**
 * Every mock reimbursement row is seeded with an `items` array, so the writes
 * below can rely on it. `recalc` keeps the denormalised `totalAmount` in step
 * after an item is added or removed.
 */
type MockReimbursement = (typeof mockReimbursements)[number];

function recalcReimbursement(reimbursement: MockReimbursement) {
  reimbursement.totalAmount = reimbursement.items.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  return reimbursement;
}

/** Roles that sit in the approval chain (§4 lists these three explicitly). */
const APPROVER_ROLES: Role[] = ["MANAGER", "DEPARTMENT_HEAD", "HRD"];

function nextTravelRef(travels: TravelRequest[]) {
  const year = new Date().getFullYear();
  const highest = travels.reduce((max, travel) => {
    const match = /TR-(\d{4})-(\d+)/.exec(travel.ref ?? "");
    return match ? Math.max(max, Number(match[2])) : max;
  }, 0);
  return `TR-${year}-${String(highest + 1).padStart(3, "0")}`;
}

/**
 * §3: submitting "generate baris Approval per level". The chain is fixed at
 * Manager → Department Head → Finance, matching the `ApprovalLevel` union,
 * and each row starts PENDING so the first decide call has a target.
 */
function buildApprovalChain(travel: TravelRequest) {
  const levels: Array<{ level: number; role: NonNullable<Approval["approverRole"]> }> = [
    { level: 1, role: "MANAGER" },
    { level: 2, role: "DEPARTMENT_HEAD" },
    { level: 3, role: "FINANCE" },
  ];
  const now = new Date().toISOString();
  return levels.map((entry) => ({
    id: Date.now() + entry.level,
    travelId: travel.id,
    level: entry.level,
    approverRole: entry.role,
    status: "PENDING" as const,
    createdAt: now,
  }));
}

/**
 * §6 states notifications are created by the other services, never by a public
 * POST. Every write path in this file calls this instead, which is how the
 * employee's own inbox fills up without a client able to fabricate an alert.
 */
function notify(input: {
  title: string;
  message: string;
  type: "APPROVAL" | "BOOKING" | "REIMBURSEMENT" | "SYSTEM";
  link?: string;
  userId: number;
}) {
  mockNotifications.unshift({
    id: nextId(mockNotifications),
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link,
    isRead: false,
    createdAt: new Date().toISOString(),
    userId: input.userId,
  });
}

/**
 * §6: notifications are "milik sendiri". Seed rows predate the `userId` field
 * and are treated as a shared system broadcast — the only way to keep the
 * Admin Travel demo account populated without rewriting the fixture.
 */
function ownNotifications(userId: number, includeBroadcasts = false) {
  return mockNotifications.filter(
    (row) =>
      row.userId === userId ||
      (includeBroadcasts && row.userId === undefined),
  );
}

/** Finance owns reimbursement verification and payment (§5). */
async function assertFinance() {
  const user = await assertAuthenticated();
  if (user.role !== "FINANCE") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya Finance yang dapat memverifikasi dan membayar reimbursement.",
      403,
    );
  }
  return user;
}

/* ── Handlers, grouped by API_SPEC section ───────────────────────────── */

/** §4 delegation list — given or received, per the spec's "diberikan & diterima". */
const handlers: Array<[string, RegExp, Handler]> = [
  /* §2 User & master data ---------------------------------------------- */

  [
    "POST",
    /^\/api\/users\/departments$/,
    async (req) => {
      await assertSuperAdmin();
      const { name } = (req.body ?? {}) as { name?: string };
      if (!name?.trim()) return badRequest("Nama departemen wajib diisi.");
      if (mockDepartments.some((d) => d.name.toLowerCase() === name.trim().toLowerCase())) {
        return badRequest("Departemen dengan nama tersebut sudah ada.");
      }
      const department: Department = {
        id: nextId(mockDepartments),
        name: name.trim(),
      };
      mockDepartments.push(department);
      return ok(department);
    },
  ],
  [
    "PUT",
    /^\/api\/users\/departments\/(\d+)$/,
    async (req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const department = mockDepartments.find((d) => d.id === id);
      if (!department) return notFound("Departemen tidak ditemukan.");

      const { name } = (req.body ?? {}) as { name?: string };
      if (!name?.trim()) return badRequest("Nama departemen wajib diisi.");
      const clash = mockDepartments.some(
        (d) => d.id !== id && d.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (clash) return badRequest("Departemen dengan nama tersebut sudah ada.");

      department.name = name.trim();
      return ok(department);
    },
  ],
  [
    "DELETE",
    /^\/api\/users\/departments\/(\d+)$/,
    async (_req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const index = mockDepartments.findIndex((d) => d.id === id);
      if (index < 0) return notFound("Departemen tidak ditemukan.");

      const inUse = mockUsers.filter((u) => u.departmentId === id).length;
      if (inUse) {
        return badRequest(
          `Departemen masih dipakai oleh ${inUse} pengguna. Pindahkan mereka lebih dulu.`,
        );
      }
      mockDepartments.splice(index, 1);
      return ok({ deleted: 1 });
    },
  ],
  [
    "GET",
    /^\/api\/users\/departments$/,
    async () => ok(mockDepartments),
  ],

  [
    "POST",
    /^\/api\/users\/positions$/,
    async (req) => {
      await assertSuperAdmin();
      const { name } = (req.body ?? {}) as { name?: string };
      if (!name?.trim()) return badRequest("Nama jabatan wajib diisi.");
      if (mockPositions.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) {
        return badRequest("Jabatan dengan nama tersebut sudah ada.");
      }
      const position: Position = { id: nextId(mockPositions), name: name.trim() };
      mockPositions.push(position);
      return ok(position);
    },
  ],
  [
    "PUT",
    /^\/api\/users\/positions\/(\d+)$/,
    async (req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const position = mockPositions.find((p) => p.id === id);
      if (!position) return notFound("Jabatan tidak ditemukan.");

      const { name } = (req.body ?? {}) as { name?: string };
      if (!name?.trim()) return badRequest("Nama jabatan wajib diisi.");
      const clash = mockPositions.some(
        (p) => p.id !== id && p.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (clash) return badRequest("Jabatan dengan nama tersebut sudah ada.");

      position.name = name.trim();
      return ok(position);
    },
  ],
  [
    "DELETE",
    /^\/api\/users\/positions\/(\d+)$/,
    async (_req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const index = mockPositions.findIndex((p) => p.id === id);
      if (index < 0) return notFound("Jabatan tidak ditemukan.");

      const inUse = mockUsers.filter((u) => u.positionId === id).length;
      if (inUse) {
        return badRequest(
          `Jabatan masih dipakai oleh ${inUse} pengguna. Pindahkan mereka lebih dulu.`,
        );
      }
      mockPositions.splice(index, 1);
      return ok({ deleted: 1 });
    },
  ],
  [
    "GET",
    /^\/api\/users\/positions$/,
    async () => ok(mockPositions),
  ],

  [
    "GET",
    /^\/api\/users$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      // §2 restricts the list itself to Admin and Super Admin.
      if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
        throw new ApiError(
          "FORBIDDEN",
          "Hanya Admin dan Super Admin yang dapat melihat daftar pengguna.",
          403,
        );
      }
      const role = url.searchParams.get("role");
      const departmentId = url.searchParams.get("departmentId");
      let rows = mockUsers.map(publicUser);
      if (role) rows = rows.filter((u) => u.role === role);
      if (departmentId) rows = rows.filter((u) => u.departmentId === Number(departmentId));
      return ok(rows.sort((a, b) => a.name.localeCompare(b.name, "id")));
    },
  ],
  [
    "PATCH",
    /^\/api\/users\/(\d+)\/role$/,
    async (req, url) => {
      const caller = await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[3]);
      const user = mockUsers.find((u) => u.id === id);
      if (!user) return notFound("Pengguna tidak ditemukan.");

      const { role } = (req.body ?? {}) as { role?: Role };
      if (!role || !SUPER_ADMIN_ROLES.includes(role)) {
        return badRequest(
          `Role tidak valid. Pilihan: ${SUPER_ADMIN_ROLES.join(", ")}.`,
        );
      }
      // A Super Admin demoting themselves could lock the system out of master
      // data, so the spec's own "ubah role user" is applied defensively here.
      if (user.id === caller.id && role !== "SUPER_ADMIN") {
        return badRequest("Anda tidak dapat mengubah role akun sendiri.");
      }

      user.role = role;
      return ok(publicUser(user));
    },
  ],
  [
    "PUT",
    /^\/api\/users\/(\d+)$/,
    async (req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[3]);
      const user = mockUsers.find((u) => u.id === id);
      if (!user) return notFound("Pengguna tidak ditemukan.");

      const { name, departmentId, positionId } = (req.body ?? {}) as {
        name?: string;
        departmentId?: number;
        positionId?: number;
      };
      if (name !== undefined) {
        if (!name.trim()) return badRequest("Nama tidak boleh kosong.");
        user.name = name.trim();
      }
      if (departmentId !== undefined) {
        const department = mockDepartments.find((d) => d.id === departmentId);
        if (!department) return badRequest("Departemen tidak ditemukan.");
        user.departmentId = department.id;
        user.departmentName = department.name;
      }
      if (positionId !== undefined) {
        const position = mockPositions.find((p) => p.id === positionId);
        if (!position) return badRequest("Jabatan tidak ditemukan.");
        user.positionId = position.id;
        user.positionName = position.name;
      }
      return ok(publicUser(user));
    },
  ],
  [
    "GET",
    /^\/api\/users\/(\d+)$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const id = Number(url.pathname.split("/")[3]);
      // Everyone may read their own record; the directory needs the check above.
      if (caller.id !== id && caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
        throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
      }
      const user = mockUsers.find((u) => u.id === id);
      if (!user) return notFound("Pengguna tidak ditemukan.");
      return ok(publicUser(user));
    },
  ],
  [
    "DELETE",
    /^\/api\/users\/(\d+)$/,
    async (_req, url) => {
      const caller = await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[3]);
      const user = mockUsers.find((u) => u.id === id);
      if (!user) return notFound("Pengguna tidak ditemukan.");
      if (user.id === caller.id) {
        return badRequest("Anda tidak dapat menonaktifkan akun sendiri.");
      }
      if (!user.isActive) return badRequest("Akun sudah tidak aktif.");
      // DELETE deactivates — the row stays so historic travel keeps a valid owner.
      user.isActive = false;
      return ok(publicUser(user));
    },
  ],

  // §1 Auth
  [
    "POST",
    /^\/api\/auth\/register$/,
    async (req) => {
      const { name, email, password, departmentId, positionId } = (req.body ?? {}) as {
        name?: string;
        email?: string;
        password?: string;
        departmentId?: number;
        positionId?: number;
      };

      const fields: Record<string, string> = {};
      if (!name?.trim()) fields.name = "Nama wajib diisi.";
      if (!email?.trim()) fields.email = "Email wajib diisi.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        fields.email = "Format email tidak valid.";
      }
      // §1's own example uses "min8char", so the floor is eight characters.
      if (!password || password.length < 8) {
        fields.password = "Password minimal 8 karakter.";
      }
      if (email && mockUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        fields.email = "Email sudah terdaftar.";
      }
      if (Object.keys(fields).length) {
        throw new ApiError("VALIDATION", "Data registrasi belum lengkap.", 422, fields);
      }

      const department = mockDepartments.find((d) => d.id === departmentId);
      const position = mockPositions.find((p) => p.id === positionId);
      const now = new Date().toISOString();
      const user = {
        id: nextId(mockUsers),
        name: name!.trim(),
        email: email!.trim(),
        // A self-registered account always starts as EMPLOYEE: §2 reserves role
        // assignment for Super Admin, so the public route cannot grant more.
        role: "EMPLOYEE" as Role,
        password: password!,
        departmentId: department?.id,
        departmentName: department?.name,
        positionId: position?.id,
        positionName: position?.name,
        isActive: true,
        createdAt: now,
      };
      mockUsers.push(user);
      return ok({ user: publicUser(user), token: `mock.${Buffer.from(user.email).toString("base64url")}.${randomUUID()}` });
    },
  ],
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

  /* §3 Travel policy CRUD — Super Admin only (§3 table) ----------------- */
  [
    "POST",
    /^\/api\/travel\/policies$/,
    async (req) => {
      await assertSuperAdmin();
      const payload = (req.body ?? {}) as Partial<TravelPolicy>;
      if (!payload.name?.trim()) return badRequest("Nama kebijakan wajib diisi.");

      const policy: TravelPolicy = {
        id: nextId(mockPolicies),
        name: payload.name.trim(),
        description: payload.description?.trim() || undefined,
        positionId: payload.positionId ?? null,
        positionName:
          mockPositions.find((p) => p.id === payload.positionId)?.name,
        destinationTier: payload.destinationTier || "ANY",
        maxEstimatedCost: payload.maxEstimatedCost ?? null,
        requiresDocuments: payload.requiresDocuments ?? false,
        isActive: payload.isActive ?? true,
      };
      mockPolicies.unshift(policy);
      return ok(policy);
    },
  ],
  [
    "PUT",
    /^\/api\/travel\/policies\/(\d+)$/,
    async (req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const policy = mockPolicies.find((p) => p.id === id);
      if (!policy) return notFound("Kebijakan tidak ditemukan.");

      const payload = (req.body ?? {}) as Partial<TravelPolicy>;
      if (payload.name !== undefined) {
        if (!payload.name.trim()) return badRequest("Nama kebijakan tidak boleh kosong.");
        policy.name = payload.name.trim();
      }
      if (payload.description !== undefined) {
        policy.description = payload.description?.trim() || undefined;
      }
      if (payload.positionId !== undefined) {
        policy.positionId = payload.positionId;
        policy.positionName =
          mockPositions.find((p) => p.id === payload.positionId)?.name;
      }
      if (payload.destinationTier !== undefined) {
        policy.destinationTier = payload.destinationTier || "ANY";
      }
      if (payload.maxEstimatedCost !== undefined) {
        policy.maxEstimatedCost = payload.maxEstimatedCost;
      }
      if (payload.requiresDocuments !== undefined) {
        policy.requiresDocuments = payload.requiresDocuments;
      }
      if (payload.isActive !== undefined) policy.isActive = payload.isActive;
      return ok(policy);
    },
  ],
  [
    "DELETE",
    /^\/api\/travel\/policies\/(\d+)$/,
    async (_req, url) => {
      await assertSuperAdmin();
      const id = Number(url.pathname.split("/")[4]);
      const index = mockPolicies.findIndex((p) => p.id === id);
      if (index < 0) return notFound("Kebijakan tidak ditemukan.");

      const policy = mockPolicies[index];
      const inUse = mockTravels.filter((t) => t.policyId === id).length;
      if (inUse) {
        return badRequest(
          `Kebijakan masih dipakai oleh ${inUse} pengajuan. Nonaktifkan sebagai gantinya.`,
        );
      }
      mockPolicies.splice(index, 1);
      return ok({ deleted: policy.id });
    },
  ],

  // §3 Travel — policies
  [
    "GET",
    /^\/api\/travel\/policies\/applicable$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const tier = url.searchParams.get("destinationTier");
      // The spec makes this endpoint Employee-scoped, and a null positionId on
      // the policy means "applies to every position" (see TravelPolicy).
      const positionId = Number(url.searchParams.get("positionId")) || caller.positionId;

      return ok(
        mockPolicies.filter(
          (policy) =>
            policy.isActive &&
            (policy.positionId === null ||
              policy.positionId === undefined ||
              policy.positionId === positionId) &&
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
    async (req, url) => {
      const caller = await assertAuthenticated();
      // Super Admin manages the catalogue, so it sees inactive rows too. Every
      // other role is an employee choosing a policy, which must be active.
      if (caller.role === "SUPER_ADMIN") {
        return ok(url.searchParams.get("includeInactive") === "true"
          ? [...mockPolicies]
          : mockPolicies.filter((policy) => policy.isActive));
      }
      return ok(mockPolicies.filter((policy) => policy.isActive));
    },
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
  /* §3 Employee-owned travel lifecycle --------------------------------- */
  [
    "POST",
    /^\/api\/travel$/,
    async (req) => {
      const caller = await assertAuthenticated();
      const payload = (req.body ?? {}) as Partial<TravelRequest>;

      const fields: Record<string, string> = {};
      if (!payload.destination?.trim()) fields.destination = "Tujuan wajib diisi.";
      if (!payload.purpose?.trim()) fields.purpose = "Tujuan dana wajib diisi.";
      if (!payload.startDate) fields.startDate = "Tanggal mulai wajib diisi.";
      if (!payload.endDate) fields.endDate = "Tanggal selesai wajib diisi.";
      if (!payload.estimatedCost || payload.estimatedCost <= 0) {
        fields.estimatedCost = "Perkiraan biaya harus lebih dari 0.";
      }
      if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
        fields.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
      }
      if (Object.keys(fields).length) {
        throw new ApiError("VALIDATION", "Data pengajuan belum lengkap.", 422, fields);
      }

      const policy = mockPolicies.find((p) => p.id === payload.policyId);
      // A named policy caps the estimate. The spec makes the cap a property of
      // the policy, so the UI can warn before submit and the server refuses.
      if (policy?.maxEstimatedCost != null && payload.estimatedCost! > policy.maxEstimatedCost) {
        throw new ApiError(
          "VALIDATION",
          "Perkiraan biaya melebihi batas kebijakan yang dipilih.",
          422,
          {
            estimatedCost: `Maksimal ${policy.maxEstimatedCost.toLocaleString("id-ID")} untuk kebijakan ini.`,
          },
        );
      }

      const travel: TravelRequest = {
        id: nextId(mockTravels),
        ref: nextTravelRef(mockTravels),
        employeeId: caller.id,
        employeeName: caller.name,
        employeeEmail: caller.email,
        positionName: caller.positionName,
        departmentId: caller.departmentId,
        departmentName: caller.departmentName,
        destination: payload.destination!.trim(),
        destinationTier: policy?.destinationTier ?? "ANY",
        purpose: payload.purpose!.trim(),
        startDate: payload.startDate!,
        endDate: payload.endDate!,
        estimatedCost: payload.estimatedCost!,
        policyId: policy?.id,
        policyName: policy?.name,
        // §3: a new request is always a DRAFT until the owner submits it.
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      };
      mockTravels.unshift(travel);
      mockApprovals[travel.id] = [];
      return ok(travel);
    },
  ],
  [
    "POST",
    /^\/api\/travel\/(\d+)\/submit$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      await assertOwner(travel);

      if (travel.status !== "DRAFT") {
        return badRequest(
          `Hanya pengajuan berstatus DRAFT yang dapat diajukan. Status saat ini: ${travel.status}.`,
        );
      }

      travel.status = "SUBMITTED";
      travel.submittedAt = new Date().toISOString();
      // §3: submit generates one approval row per level.
      mockApprovals[travelId] = buildApprovalChain(travel);
      notify({
        title: "Pengajuan diajukan",
        message: `${travel.ref} menunggu persetujuan atasan.`,
        type: "APPROVAL",
        link: `/employee/travel/${travelId}`,
        userId: travel.employeeId,
      });
      return ok(travel);
    },
  ],
  [
    "POST",
    /^\/api\/travel\/(\d+)\/cancel$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      await assertOwner(travel);

      if (travel.status === "COMPLETED") {
        return badRequest("Pengajuan yang sudah selesai tidak dapat dibatalkan.");
      }
      if (travel.status === "CANCELLED") {
        return badRequest("Pengajuan sudah dibatalkan.");
      }

      travel.status = "CANCELLED";
      travel.cancelledAt = new Date().toISOString();
      // Approvals generated at submit time no longer apply to a cancelled run.
      mockApprovals[travelId] = (mockApprovals[travelId] ?? []).map((row) =>
        row.status === "PENDING" ? { ...row, status: "REJECTED" as const, note: "Dibatalkan oleh pemohon." } : row,
      );
      return ok(travel);
    },
  ],
  [
    "PATCH",
    /^\/api\/travel\/(\d+)$/,
    async (req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      await assertOwner(travel);

      if (travel.status !== "DRAFT") {
        return badRequest(
          `Pengajuan hanya dapat diubah saat masih DRAFT. Status saat ini: ${travel.status}.`,
        );
      }

      const payload = (req.body ?? {}) as Partial<TravelRequest>;
      if (payload.destination?.trim()) travel.destination = payload.destination.trim();
      if (payload.purpose?.trim()) travel.purpose = payload.purpose.trim();
      if (payload.startDate) travel.startDate = payload.startDate;
      if (payload.endDate) travel.endDate = payload.endDate;
      if (payload.estimatedCost && payload.estimatedCost > 0) {
        travel.estimatedCost = payload.estimatedCost;
      }
      if (payload.policyId !== undefined) {
        const policy = mockPolicies.find((p) => p.id === payload.policyId);
        travel.policyId = policy?.id;
        travel.policyName = policy?.name;
        travel.destinationTier = policy?.destinationTier ?? travel.destinationTier;
      }

      if (travel.endDate < travel.startDate) {
        return badRequest("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      }
      return ok(travel);
    },
  ],
  [
    "DELETE",
    /^\/api\/travel\/(\d+)$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const index = mockTravels.findIndex((t) => t.id === travelId);
      if (index < 0) return notFound("Travel request tidak ditemukan.");
      await assertOwner(mockTravels[index]);

      if (mockTravels[index].status !== "DRAFT") {
        return badRequest("Hanya draft yang dapat dihapus.");
      }
      mockTravels.splice(index, 1);
      delete mockApprovals[travelId];
      return ok({ deleted: travelId });
    },
  ],
  [
    "POST",
    /^\/api\/travel\/(\d+)\/documents$/,
    async (req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      await assertOwner(travel);

      // multipart: the browser supplies the boundary, so the file is read from
      // the FormData rather than a JSON body.
      const body = req.body as FormData | undefined;
      const file = body?.get?.("file");
      if (!file || typeof file === "string") {
        return badRequest("File belum dipilih.");
      }
      const upload = file as File;
      return ok({
        id: Date.now(),
        travelId,
        fileName: upload.name,
        filePath: `uploads/documents/tr-${travelId}/${upload.name}`,
        mimeType: upload.type,
        size: upload.size,
        uploadedAt: new Date().toISOString(),
      });
    },
  ],
  [
    "DELETE",
    /^\/api\/travel\/documents\/(\d+)$/,
    async (_req, url) => {
      const documentId = Number(url.pathname.split("/")[4]);
      const travelId = Number(url.searchParams.get("travelId") ?? "") || null;
      if (travelId) {
        const travel = mockTravels.find((t) => t.id === travelId);
        if (!travel) return notFound("Travel request tidak ditemukan.");
        await assertOwner(travel);
      } else {
        await assertAuthenticated();
      }
      return ok({ deleted: documentId });
    },
  ],
  [
    "GET",
    /^\/api\/travel\/(\d+)$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");

      const caller = await assertAuthenticated();
      // §3: owner, related approver, or Admin. Booking managers and Super Admin
      // are included because the spec grants Super Admin visibility of all data.
      const isOwner = travel.employeeId === caller.id;
      const isApprover = (mockApprovals[travelId] ?? []).some(
        (row) => row.status === "PENDING" && APPROVER_ROLES.includes(caller.role),
      );
      const isAdmin =
        caller.role === "ADMIN" ||
        caller.role === "SUPER_ADMIN" ||
        isApprover;
      if (!isOwner && !isAdmin) {
        throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
      }

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
      const caller = await assertAuthenticated();
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search")?.toLowerCase();
      const departmentId = url.searchParams.get("departmentId");

      // §3: "Employee: milik sendiri; Admin/Approver: semua/filtered". A
      // Super Admin is an approver-level reader per the §8 "lihat semua data".
      let rows =
        caller.role === "EMPLOYEE"
          ? mockTravels.filter((t) => t.employeeId === caller.id)
          : [...mockTravels];

      if (status) rows = rows.filter((t) => t.status === status);
      if (departmentId) {
        rows = rows.filter((t) => t.departmentId === Number(departmentId));
      }
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

  /* §4 Approval --------------------------------------------------------- */
  [
    "GET",
    /^\/api\/approvals\/pending$/,
    async () => {
      const caller = await assertAuthenticated();
      if (!APPROVER_ROLES.includes(caller.role)) {
        throw new ApiError(
          "FORBIDDEN",
          "Hanya approver yang memiliki antrean persetujuan.",
          403,
        );
      }

      // §4 also lists rows "termasuk yang didelegasikan ke dia". A delegation
      // transfers one approver's authority, so a row is in this user's queue
      // when its level is theirs, or when the delegator of an active delegation
      // to them is the person who owns that level.
      const now = new Date().toISOString().slice(0, 10);
      const delegatorIds = new Set(
        mockDelegations
          .filter(
            (row) =>
              row.delegateId === caller.id &&
              row.startDate <= now &&
              row.endDate >= now,
          )
          .map((row) => row.delegatorId),
      );
      const delegatedRoles = new Set(
        [...delegatorIds]
          .map((id) => mockUsers.find((u) => u.id === id)?.role)
          .filter((role): role is Role => !!role && APPROVER_ROLES.includes(role)),
      );

      const rows: Array<Approval & { travel?: TravelRequest }> = [];
      for (const [travelId, approvals] of Object.entries(mockApprovals)) {
        const travel = mockTravels.find((t) => t.id === Number(travelId));
        for (const approval of approvals) {
          if (approval.status !== "PENDING") continue;
          if (
            approval.approverRole !== caller.role &&
            !delegatedRoles.has(approval.approverRole)
          ) {
            continue;
          }
          rows.push({
            ...approval,
            delegatedToName: delegatedRoles.has(approval.approverRole)
              ? caller.name
              : undefined,
            travel,
          });
        }
      }
      return ok(rows);
    },
  ],
  [
    "PATCH",
    /^\/api\/approvals\/(\d+)\/decision$/,
    async (req, url) => {
      const caller = await assertAuthenticated();
      const approvalId = Number(url.pathname.split("/")[3]);
      const { status, note } = (req.body ?? {}) as {
        status?: "APPROVED" | "REJECTED";
        note?: string;
      };
      if (status !== "APPROVED" && status !== "REJECTED") {
        return badRequest("Status keputusan harus APPROVED atau REJECTED.");
      }

      const entry = Object.entries(mockApprovals).find(([, rows]) =>
        rows.some((row) => row.id === approvalId),
      );
      if (!entry) return notFound("Approval tidak ditemukan.");
      const [travelId, rows] = entry;
      const approval = rows.find((row) => row.id === approvalId)!;

      if (approval.status !== "PENDING") {
        return badRequest("Approval ini sudah diputuskan.");
      }
      if (approval.approverRole !== caller.role) {
        throw new ApiError(
          "FORBIDDEN",
          "Anda bukan approver pada level ini.",
          403,
        );
      }

      approval.status = status;
      approval.note = note?.trim() || undefined;
      approval.decidedAt = new Date().toISOString();
      approval.approverName = caller.name;

      // A rejection stops the chain: later levels are closed out too.
      if (status === "REJECTED") {
        for (const row of rows) {
          if (row.level > approval.level && row.status === "PENDING") {
            row.status = "REJECTED";
            row.note = "Ditolak pada level sebelumnya.";
          }
        }
      }

      const travel = mockTravels.find((t) => t.id === Number(travelId));
      if (travel) {
        const remaining = rows.some((row) => row.status === "PENDING");
        if (!remaining) {
          travel.status = status === "REJECTED" ? "REJECTED" : "APPROVED";
        }
        if (travel.employeeId) {
          notify({
            title: status === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak",
            message: `${travel.ref} — level ${approval.level} (${approval.approverRole}) disetujui oleh ${caller.name}.`,
            type: "APPROVAL",
            link: `/employee/travel/${travel.id}`,
            userId: travel.employeeId,
          });
        }
        // An approved request with no booking yet joins the Admin Travel queue.
        if (travel.status === "APPROVED" && !mockBookings.some((b) => b.travelId === travel.id)) {
          const index = mockPendingTravels.findIndex((t) => t.id === travel.id);
          if (index < 0) {
            mockPendingTravels.push({
              id: travel.id,
              ref: travel.ref ?? `TR-${travel.id}`,
              employeeId: travel.employeeId,
              employeeName: travel.employeeName,
              positionName: travel.positionName,
              departmentId: travel.departmentId,
              departmentName: travel.departmentName,
              destination: travel.destination,
              destinationTier: travel.destinationTier ?? "ANY",
              purpose: travel.purpose,
              startDate: travel.startDate,
              endDate: travel.endDate,
              estimatedCost: travel.estimatedCost,
              policyId: travel.policyId,
              policyName: travel.policyName,
              status: "APPROVED",
              approvedAt: new Date().toISOString(),
              waitingHours: 0,
            });
          }
        }
      }
      return ok(approval);
    },
  ],
  [
    "GET",
    /^\/api\/approvals\/travel\/(\d+)$/,
    async (_req, url) => {
      const travelId = Number(url.pathname.split("/")[3]);
      const caller = await assertAuthenticated();
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");

      const rows = mockApprovals[travelId] ?? [];
      const related = APPROVER_ROLES.includes(caller.role);
      if (travel.employeeId !== caller.id && !related && caller.role !== "SUPER_ADMIN") {
        throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
      }
      return ok(rows);
    },
  ],

  /* §4 Delegation -------------------------------------------------------- */
  [
    "GET",
    /^\/api\/approvals\/delegations$/,
    async () => {
      const caller = await assertAuthenticated();
      return ok(
        mockDelegations.filter(
          (row) => row.delegatorId === caller.id || row.delegateId === caller.id,
        ),
      );
    },
  ],
  [
    "POST",
    /^\/api\/approvals\/delegations$/,
    async (req) => {
      const caller = await assertAuthenticated();
      if (!APPROVER_ROLES.includes(caller.role)) {
        throw new ApiError("FORBIDDEN", "Hanya approver yang dapat membuat delegasi.", 403);
      }

      const { delegateId, startDate, endDate, reason } = (req.body ?? {}) as {
        delegateId?: number;
        startDate?: string;
        endDate?: string;
        reason?: string;
      };
      const fields: Record<string, string> = {};
      if (!delegateId) fields.delegateId = "Pilih user pengganti.";
      if (!startDate) fields.startDate = "Tanggal mulai wajib diisi.";
      if (!endDate) fields.endDate = "Tanggal selesai wajib diisi.";
      if (startDate && endDate && endDate < startDate) {
        fields.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
      }
      const delegate = mockUsers.find((u) => u.id === delegateId);
      if (delegateId && !delegate) fields.delegateId = "User tidak ditemukan.";
      if (delegate && !APPROVER_ROLES.includes(delegate.role)) {
        fields.delegateId = "Delegasi hanya dapat diberikan kepada approver.";
      }
      if (Object.keys(fields).length) {
        throw new ApiError("VALIDATION", "Data delegasi belum lengkap.", 422, fields);
      }

      const delegation = {
        id: nextId(mockDelegations),
        delegatorId: caller.id,
        delegatorName: caller.name,
        delegateId: delegate!.id,
        delegateName: delegate!.name,
        startDate: startDate!,
        endDate: endDate!,
        reason: reason?.trim() || undefined,
        isActive: false,
      };
      mockDelegations.push(delegation);
      return ok(delegation);
    },
  ],
  [
    "DELETE",
    /^\/api\/approvals\/delegations\/(\d+)$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const id = Number(url.pathname.split("/")[4]);
      const index = mockDelegations.findIndex((row) => row.id === id);
      if (index < 0) return notFound("Delegasi tidak ditemukan.");
      // §4: only the owner of the delegation may cancel it.
      if (mockDelegations[index].delegatorId !== caller.id) {
        throw new ApiError("FORBIDDEN", "Hanya pembuat delegasi yang dapat membatalkannya.", 403);
      }
      if (mockDelegations[index].isActive) {
        return badRequest("Delegasi yang sudah aktif tidak dapat dibatalkan.");
      }
      mockDelegations.splice(index, 1);
      return ok({ deleted: id });
    },
  ],

  /* §5 Reimbursement ---------------------------------------------------- */
  [
    "POST",
    /^\/api\/reimbursements$/,
    async (req) => {
      const caller = await assertAuthenticated();
      const { travelId } = (req.body ?? {}) as { travelId?: number };
      const travel = mockTravels.find((t) => t.id === travelId);
      if (!travel) return notFound("Travel request tidak ditemukan.");
      await assertOwner(travel);

      if (travel.status !== "COMPLETED") {
        return badRequest(
          `Reimbursement hanya dapat dibuat untuk travel berstatus COMPLETED. Status saat ini: ${travel.status}.`,
        );
      }
      const existing = mockReimbursements.find(
        (row) => row.travelId === travel.id && row.status !== "REJECTED",
      );
      if (existing) {
        return badRequest("Travel ini sudah memiliki reimbursement aktif.");
      }

      const reimbursement: MockReimbursement = {
        id: nextId(mockReimbursements),
        travelId: travel.id,
        travelRef: travel.ref,
        employeeId: caller.id,
        employeeName: caller.name,
        departmentName: caller.departmentName,
        totalAmount: 0,
        advanceAmount: 0,
        approvedAmount: 0,
        differenceAmount: 0,
        status: "DRAFT",
        items: [],
      };
      mockReimbursements.unshift(reimbursement);
      return ok(reimbursement);
    },
  ],
  [
    "GET",
    /^\/api\/reimbursements$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const status = url.searchParams.get("status") as ReimbursementStatus | null;

      // §5: Employee sees their own, Finance sees all.
      let rows =
        caller.role === "FINANCE"
          ? [...mockReimbursements]
          : mockReimbursements.filter((row) => row.employeeId === caller.id);
      if (status) rows = rows.filter((row) => row.status === status);
      return ok(rows.sort((a, b) => b.id - a.id));
    },
  ],
  [
    "POST",
    /^\/api\/reimbursements\/(\d+)\/items$/,
    async (req, url) => {
      const id = Number(url.pathname.split("/")[3]);
      const reimbursement = mockReimbursements.find((row) => row.id === id);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");
      await assertOwner(reimbursement);

      if (reimbursement.status !== "DRAFT") {
        return badRequest("Item hanya dapat ditambah saat reimbursement masih DRAFT.");
      }

      const payload = (req.body ?? {}) as Partial<ReimbursementItem>;
      const fields: Record<string, string> = {};
      const categories = ["HOTEL", "TRANSPORT", "MEAL", "TICKET", "OTHER"];
      if (!payload.category || !categories.includes(payload.category)) {
        fields.category = "Kategori item wajib dipilih.";
      }
      if (!payload.description?.trim()) fields.description = "Deskripsi wajib diisi.";
      if (!payload.amount || payload.amount <= 0) {
        fields.amount = "Nominal harus lebih dari 0.";
      }
      if (!payload.transactionDate) fields.transactionDate = "Tanggal transaksi wajib diisi.";
      if (Object.keys(fields).length) {
        throw new ApiError("VALIDATION", "Data item belum lengkap.", 422, fields);
      }

      const item: ReimbursementItem = {
        id: Date.now(),
        category: payload.category as ReimbursementItem["category"],
        description: payload.description!.trim(),
        amount: payload.amount!,
        transactionDate: payload.transactionDate!,
        receiptPath: payload.receiptPath,
      };
      reimbursement.items = [...reimbursement.items, item];
      recalcReimbursement(reimbursement);
      return ok(item);
    },
  ],
  [
    "POST",
    /^\/api\/reimbursements\/(\d+)\/submit$/,
    async (_req, url) => {
      const id = Number(url.pathname.split("/")[3]);
      const reimbursement = mockReimbursements.find((row) => row.id === id);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");
      await assertOwner(reimbursement);

      if (reimbursement.status !== "DRAFT") {
        return badRequest("Hanya reimbursement DRAFT yang dapat diajukan.");
      }
      if (!reimbursement.items.length) {
        return badRequest("Tambahkan minimal satu item sebelum mengajukan.");
      }

      reimbursement.status = "SUBMITTED";
      reimbursement.submittedAt = new Date().toISOString();
      const finance = mockUsers.find((u) => u.role === "FINANCE");
      if (finance) {
        notify({
          title: "Reimbursement menunggu verifikasi",
          message: `${reimbursement.employeeName} mengajukan ${reimbursement.totalAmount.toLocaleString("id-ID")}.`,
          type: "REIMBURSEMENT",
          link: `/finance/reimbursements/${reimbursement.id}`,
          userId: finance.id,
        });
      }
      return ok(reimbursement);
    },
  ],
  [
    "PATCH",
    /^\/api\/reimbursements\/(\d+)\/verify$/,
    async (req, url) => {
      await assertFinance();
      const id = Number(url.pathname.split("/")[3]);
      const reimbursement = mockReimbursements.find((row) => row.id === id);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");
      if (reimbursement.status !== "SUBMITTED") {
        return badRequest("Hanya reimbursement SUBMITTED yang dapat diverifikasi.");
      }

      const { approvedAmount, status, note } = (req.body ?? {}) as {
        approvedAmount?: number;
        status?: "APPROVED" | "REJECTED";
        note?: string;
      };
      if (status !== "APPROVED" && status !== "REJECTED") {
        return badRequest("Status verifikasi harus APPROVED atau REJECTED.");
      }
      if (approvedAmount === undefined || approvedAmount < 0) {
        return badRequest("Nominal disetujui wajib diisi.");
      }

      reimbursement.approvedAmount = approvedAmount;
      reimbursement.status = status;
      // The spec has the server compute this: differenceAmount = approved - advance.
      reimbursement.differenceAmount = approvedAmount - reimbursement.advanceAmount;
      notify({
        title: status === "APPROVED" ? "Reimbursement disetujui" : "Reimbursement ditolak",
        message: note?.trim() || `Verifikasi Finance untuk ${reimbursement.travelRef ?? "travel"}.`,
        type: "REIMBURSEMENT",
        link: `/employee/reimbursements/${reimbursement.id}`,
        userId: reimbursement.employeeId,
      });
      return ok(reimbursement);
    },
  ],
  [
    "PATCH",
    /^\/api\/reimbursements\/(\d+)\/pay$/,
    async (req, url) => {
      await assertFinance();
      const id = Number(url.pathname.split("/")[3]);
      const reimbursement = mockReimbursements.find((row) => row.id === id);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");
      if (reimbursement.status !== "APPROVED") {
        return badRequest("Hanya reimbursement APPROVED yang dapat dibayar.");
      }

      const { externalJournalRef } = (req.body ?? {}) as { externalJournalRef?: string };
      if (!externalJournalRef?.trim()) {
        return badRequest("Referensi jurnal wajib diisi.");
      }

      reimbursement.status = "PAID";
      reimbursement.paidAt = new Date().toISOString();
      reimbursement.externalJournalRef = externalJournalRef.trim();
      notify({
        title: "Reimbursement dibayarkan",
        message: `Pembayaran ${reimbursement.approvedAmount.toLocaleString("id-ID")} telah diproses.`,
        type: "REIMBURSEMENT",
        link: `/employee/reimbursements/${reimbursement.id}`,
        userId: reimbursement.employeeId,
      });
      return ok(reimbursement);
    },
  ],
  [
    "DELETE",
    /^\/api\/reimbursements\/items\/(\d+)$/,
    async (_req, url) => {
      const itemId = Number(url.pathname.split("/")[4]);
      const reimbursementId = Number(url.searchParams.get("reimbursementId") ?? "");
      const reimbursement = mockReimbursements.find((row) => row.id === reimbursementId);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");
      await assertOwner(reimbursement);

      if (reimbursement.status !== "DRAFT") {
        return badRequest("Item hanya dapat dihapus saat reimbursement masih DRAFT.");
      }
      const items = reimbursement.items;
      if (!items.some((item) => item.id === itemId)) {
        return notFound("Item tidak ditemukan.");
      }
      reimbursement.items = items.filter((item) => item.id !== itemId);
      recalcReimbursement(reimbursement);
      return ok({ deleted: itemId });
    },
  ],
  [
    "GET",
    /^\/api\/reimbursements\/(\d+)$/,
    async (_req, url) => {
      const id = Number(url.pathname.split("/")[3]);
      const reimbursement = mockReimbursements.find((row) => row.id === id);
      if (!reimbursement) return notFound("Reimbursement tidak ditemukan.");

      const caller = await assertAuthenticated();
      if (reimbursement.employeeId !== caller.id && caller.role !== "FINANCE") {
        throw new ApiError("FORBIDDEN", "Akses ditolak.", 403);
      }
      return ok(reimbursement);
    },
  ],

  // §6 Notification
  [
    "GET",
    /^\/api\/notifications\/unread-count$/,
    async () => {
      const caller = await assertAuthenticated();
      return ok({ count: ownNotifications(caller.id).filter((n) => !n.isRead).length });
    },
  ],
  [
    "GET",
    /^\/api\/notifications$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const isRead = url.searchParams.get("isRead");
      let rows = ownNotifications(caller.id);
      if (isRead === "true") rows = rows.filter((n) => n.isRead);
      if (isRead === "false") rows = rows.filter((n) => !n.isRead);
      return ok(rows);
    },
  ],
  [
    "PATCH",
    /^\/api\/notifications\/read-all$/,
    async () => {
      const caller = await assertAuthenticated();
      const rows = ownNotifications(caller.id, true);
      rows.forEach((n) => {
        n.isRead = true;
      });
      return ok({ updated: rows.length });
    },
  ],
  [
    "PATCH",
    /^\/api\/notifications\/(\d+)\/read$/,
    async (_req, url) => {
      const caller = await assertAuthenticated();
      const id = Number(url.pathname.split("/")[3]);
      // §6 scopes this to the notification's owner, so a guessed id from
      // another account resolves to not-found rather than a foreign row.
      const notification = ownNotifications(caller.id, true).find((n) => n.id === id);
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

    if (req.hasAuth) await assertAuthenticated();

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
