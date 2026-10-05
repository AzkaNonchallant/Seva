import { Badge } from "./badge";

import type {
  BookingStatus,
  NotificationType,
  ReimbursementStatus,
  TravelStatus,
} from "@/lib/api/types";

/**
 * Status labels and tones.
 *
 * The vocabulary follows what the backend actually accepts, which differs from
 * API_SPEC §3 in two places: `IN_REVIEW` is a real travel status, and booking
 * `CANCELLED` is reachable through the status endpoint.
 */

const BOOKING_TONE: Record<BookingStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
};

const BOOKING_LABEL: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Terkonfirmasi",
  CANCELLED: "Dibatalkan",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={BOOKING_TONE[status]} dot>
      {BOOKING_LABEL[status]}
    </Badge>
  );
}

const TRAVEL_TONE: Record<
  TravelStatus,
  "neutral" | "primary" | "success" | "warning" | "error" | "accent"
> = {
  DRAFT: "neutral",
  SUBMITTED: "accent",
  IN_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "neutral",
  COMPLETED: "primary",
};

const TRAVEL_LABEL: Record<TravelStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  IN_REVIEW: "Ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
};

export function TravelStatusBadge({ status }: { status: TravelStatus }) {
  return (
    <Badge tone={TRAVEL_TONE[status]} dot>
      {TRAVEL_LABEL[status]}
    </Badge>
  );
}

const REIMBURSEMENT_TONE: Record<
  ReimbursementStatus,
  "neutral" | "primary" | "success" | "warning" | "error"
> = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "error",
  PAID: "primary",
};

const REIMBURSEMENT_LABEL: Record<ReimbursementStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Menunggu verifikasi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  PAID: "Dibayarkan",
};

export function ReimbursementStatusBadge({
  status,
}: {
  status: ReimbursementStatus;
}) {
  return (
    <Badge tone={REIMBURSEMENT_TONE[status]} dot>
      {REIMBURSEMENT_LABEL[status]}
    </Badge>
  );
}

/**
 * Icon per notification type.
 *
 * The backend emits a wider set than API_SPEC §6 lists — `TRAVEL_APPROVED`,
 * `APPROVAL_REQUIRED` and friends — and sends no `link`, so the notification
 * list routes on the type instead of a server-supplied URL.
 */
const NOTIFICATION_ICON: Record<NotificationType, string> = {
  APPROVAL_REQUIRED: "verified_user",
  TRAVEL_SUBMITTED: "outgoing_mail",
  TRAVEL_APPROVED: "task_alt",
  TRAVEL_REJECTED: "cancel",
  TRAVEL_CANCELLED: "event_busy",
  BOOKING_CREATED: "confirmation_number",
  BOOKING_CONFIRMED: "luggage",
  REIMBURSEMENT_SUBMITTED: "receipt_long",
  REIMBURSEMENT_APPROVED: "account_balance_wallet",
  REIMBURSEMENT_REJECTED: "report",
  REIMBURSEMENT_PAID: "paid",
  SYSTEM: "campaign",
};

export function notificationIcon(type: NotificationType) {
  return NOTIFICATION_ICON[type] ?? "notifications";
}

export {
  BOOKING_LABEL,
  REIMBURSEMENT_LABEL,
  TRAVEL_LABEL,
};