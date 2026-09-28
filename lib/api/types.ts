/**
 * Domain types mirroring the shapes described in API_SPEC.md.
 *
 * Field names follow the spec's request/response examples verbatim
 * (camelCase: `estimatedCost`, `policyId`, `travelId`, ...) so a real
 * backend response can be dropped in without renaming anything.
 */

export type Role =
  | "EMPLOYEE"
  | "MANAGER"
  | "DEPARTMENT_HEAD"
  | "HRD"
  | "FINANCE"
  | "ADMIN"
  | "SUPER_ADMIN";

/** Envelope used by every endpoint in the spec. */
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  isActive?: boolean;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export type TravelStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type ApprovalLevel = "MANAGER" | "DEPARTMENT_HEAD" | "HRD" | "FINANCE";

export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED";

export interface Approval {
  id: number;
  travelId: number;
  level: number;
  approverRole: ApprovalLevel;
  approverName?: string;
  /** Set when a delegation is active for this row. */
  delegatedToName?: string;
  status: ApprovalDecision;
  note?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface TravelDocument {
  id: number;
  travelId: number;
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
  uploadedAt: string;
}

export interface TravelRequest {
  id: number;
  ref?: string;
  employeeId: number;
  employeeName: string;
  employeeEmail?: string;
  positionName?: string;
  departmentId?: number;
  departmentName?: string;
  destination: string;
  destinationTier?: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  policyId?: number;
  policyName?: string;
  status: TravelStatus;
  createdAt: string;
  submittedAt?: string;
  cancelledAt?: string;
  /** Present on `GET /api/travel/:id` only. */
  approvals?: Approval[];
  documents?: TravelDocument[];
  bookings?: Booking[];
}

export type BookingType = "FLIGHT" | "HOTEL" | "TRAIN" | "TRANSPORT";

/** Only the three statuses the spec exposes on PATCH .../status. */
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: number;
  travelId: number;
  travelRef?: string;
  type: BookingType;
  provider?: string;
  referenceNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  amount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingInput {
  type: BookingType;
  provider?: string;
  referenceNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  amount: number;
  notes?: string;
}

export interface TravelPolicy {
  id: number;
  name: string;
  description?: string;
  /** null means the policy applies to every position. */
  positionId?: number | null;
  positionName?: string;
  destinationTier?: string;
  /** null means uncapped. */
  maxEstimatedCost?: number | null;
  requiresDocuments?: boolean;
  isActive: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type?: "APPROVAL" | "BOOKING" | "REIMBURSEMENT" | "SYSTEM";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportDashboard {
  ongoing: number;
  upcoming: number;
  completed: number;
  total: number;
}

/** Per-type split used by the dashboard donut. Derived from bookings. */
export interface BookingStatusBreakdown {
  PENDING: number;
  CONFIRMED: number;
  CANCELLED: number;
}

export interface Delegation {
  id: number;
  delegatorName: string;
  delegateId: number;
  delegateName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  isActive: boolean;
}
