import type { BookingStatus, TravelStatus } from "@/lib/api/types";
import type { ReimbursementStatus } from "@/lib/api/types";

import { Badge } from "./badge";

/**
 * Status vocabulary is fixed by API_SPEC. Booking exposes exactly
 * PENDING / CONFIRMED / CANCELLED on PATCH .../status, so the UI offers no
 * other option and the badge set mirrors that list one-to-one.
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

/**
 * §5 exposes exactly these five states, so the badge set mirrors the spec's
 * list one-to-one rather than offering a status the backend would reject.
 */
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

const TRAVEL_TONE: Record<TravelStatus, "neutral" | "primary" | "success" | "warning" | "error" | "accent"> = {
  DRAFT: "neutral",
  SUBMITTED: "accent",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "neutral",
  COMPLETED: "primary",
};

const TRAVEL_LABEL: Record<TravelStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
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

export {
  TRAVEL_LABEL,
  BOOKING_LABEL,
  REIMBURSEMENT_LABEL,
};
