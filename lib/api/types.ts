/**
 * Domain types.
 *
 * These mirror the responses the backend actually returns. Where the backend
 * differs from `API_SPEC.md` the backend wins, because that is the thing that
 * runs; the differences are called out in each type's comment.
 *
 * Two conventions hold throughout:
 *
 * - **Money arrives as a string.** Prisma's `Decimal` serialises that way, so
 *   `estimatedCost` is `"12750000"` rather than a number. `toNumber()` below is
 *   the single place that converts, and every consumer goes through it rather
 *   than coercing inline.
 * - **List endpoints nest their rows.** A paginated read answers with
 *   `{ data: { data: [...], pagination } }` (or `items` for reimbursements),
 *   while a single read answers with `{ data: {...} }`. `apiRequest` flattens
 *   both into `Page<T>`, so no component sees the nesting.
 */

/** Every role the backend accepts. `TRAVEL_ADMIN` is not in API_SPEC §8. */
export type Role =
  | "EMPLOYEE"
  | "MANAGER"
  | "DEPARTMENT_HEAD"
  | "HRD"
  | "FINANCE"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "TRAVEL_ADMIN";

/**
 * Coerces a backend decimal string to a number.
 *
 * Money is the only place this is needed, but it is a real trap: `"12750000" + 1`
 * concatenates, and `Intl.NumberFormat` renders a string as `NaN`.
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string; errors?: ApiFieldError[] };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** The envelope every paginated list endpoint resolves to. */
export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

export interface Department {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Position {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A user as the backend returns it.
 *
 * `Department` and `Position` arrive as nested objects rather than the
 * `departmentName` / `positionName` strings the older spec described, and there
 * is an `externalEmployeeId` the app does not currently use.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  externalEmployeeId?: string;
  departmentId: number | null;
  positionId: number | null;
  createdAt?: string;
  updatedAt?: string;
  Department?: Department | null;
  Position?: Position | null;
}

export interface AuthPayload {
  user: User;
  token: string;
}

/**
 * `IN_REVIEW` is a real backend status that API_SPEC §3 does not list.
 */
export type TravelStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED";

export interface Approval {
  id: number;
  travelId: number;
  /** The approver is a user id, not a role as the spec implied. */
  approverId: number;
  level: number;
  status: ApprovalDecision;
  note?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approver?: Pick<User, "id" | "name" | "email"> | null;
  travel?: TravelRequest | null;
}

export interface TravelDocument {
  id: number;
  travelId: number;
  fileName: string;
  filePath: string;
  /** Named `fileType`, not `mimeType`, and nullable. */
  fileType?: string | null;
  uploadedAt?: string;
}

/**
 * The nested `user` the backend includes on every travel row, so a list can
 * show who raised a request without a second call.
 */
export interface TravelOwner {
  id: number;
  name: string;
  email: string;
}

/**
 * A travel request.
 *
 * Two deliberate departures from API_SPEC §3: ownership is `userId` (not
 * `employeeId`) and there is no `ref` field — the backend does not mint one.
 * Every consumer therefore identifies a request by its numeric id.
 */
export interface TravelRequest {
  id: number;
  userId: number;
  policyId: number | null;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  status: TravelStatus;
  /** Decimal string, e.g. `"12750000"`. */
  estimatedCost: string;
  createdAt?: string;
  updatedAt?: string;
  user?: TravelOwner | null;
  /** Detail responses only. */
  approvals?: Approval[];
  documents?: TravelDocument[];
  bookings?: Booking[];
}

/** Only the two tiers the backend accepts on the applicable-policy filter. */
export type DestinationTier = "DOMESTIC" | "INTERNATIONAL";

/**
 * A travel policy.
 *
 * The backend models a policy as three spending limits, not the single
 * `maxEstimatedCost` cap plus `requiresDocuments` / `isActive` flags the spec
 * describes. There is no active flag: all nine seeded policies are live.
 */
export interface TravelPolicy {
  id: number;
  name: string;
  positionId: number | null;
  destinationTier: DestinationTier;
  hotelLimit: string;
  transportLimit: string;
  allowanceLimit: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingType = "FLIGHT" | "HOTEL" | "TRAIN" | "TRANSPORT";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: number;
  travelId: number;
  type: BookingType;
  provider?: string | null;
  /** The backend's name for the PNR / confirmation code. */
  bookingCode?: string | null;
  description?: string | null;
  bookingDate?: string | null;
  amount: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingInput {
  type: BookingType;
  provider?: string;
  bookingCode?: string;
  description?: string;
  bookingDate?: string;
  amount: number;
  notes?: string;
}

/**
 * Notification types the backend emits.
 *
 * `APPROVAL` and `BOOKING`, which API_SPEC §6 lists, are not among them, and
 * there is no `link` field — the notification list therefore navigates by its
 * own type rather than following a server-supplied URL.
 */
export type NotificationType =
  | "APPROVAL_REQUIRED"
  | "TRAVEL_SUBMITTED"
  | "TRAVEL_APPROVED"
  | "TRAVEL_REJECTED"
  | "TRAVEL_CANCELLED"
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "REIMBURSEMENT_SUBMITTED"
  | "REIMBURSEMENT_APPROVED"
  | "REIMBURSEMENT_REJECTED"
  | "REIMBURSEMENT_PAID"
  | "SYSTEM";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: string;
}

/** The `/api/reports/dashboard` payload, which is keyed by status. */
export interface ReportDashboard {
  total: number;
  byStatus: Record<TravelStatus, number>;
  upcoming: number;
  ongoing: number;
  completed: number;
  /** Decimal string. */
  totalEstimatedCost: string;
}

export type BookingStatusBreakdown = Record<BookingStatus, number>;

export interface ExpenseByDepartment {
  departmentId: number | null;
  department: string;
  total: string;
}

export interface ExpenseByEmployee {
  userId: number | null;
  employee: string;
  total: string;
}

export interface ExpenseByProject {
  project: string;
  total: string;
}

export interface Delegation {
  id: number;
  delegatorId: number;
  delegateId: number;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  delegator?: Pick<User, "id" | "name"> | null;
  delegate?: Pick<User, "id" | "name"> | null;
}

export type ReimbursementStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

/** `ALLOWANCE` is real here; API_SPEC §5 lists `TICKET` instead. */
export type ReimbursementCategory =
  | "TRANSPORT"
  | "HOTEL"
  | "MEAL"
  | "ALLOWANCE"
  | "OTHER";

export interface ReimbursementItem {
  id: number;
  reimbursementId: number;
  category: ReimbursementCategory;
  description: string;
  amount: string;
  transactionDate: string;
  receiptPath?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reimbursement {
  id: number;
  travelId: number;
  advanceAmount: string;
  totalAmount: string;
  approvedAmount: string | null;
  differenceAmount: string | null;
  status: ReimbursementStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  externalJournalRef?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Present on the list endpoint. */
  travel?: TravelRequest | null;
  /** Present on the detail endpoint only. */
  items?: ReimbursementItem[];
}