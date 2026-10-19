import Link from "next/link";

import { APPROVAL_LEVEL_TITLE } from "@/components/travel/approval-timeline";
import { formatDateRange, formatDateTime } from "@/lib/utils";

import type { Approval } from "@/lib/api/types";

/**
 * One pending approval in an approver's queue.
 *
 * The card links to the travel request rather than to the approval, because the
 * backend serves no `GET /api/approvals/:id` — a decision is always made on the
 * request as a whole, and the detail page reads it back through
 * `GET /api/travel/:id`.
 *
 * `GET /api/approvals/pending` embeds only four fields of the travel:
 * destination, purpose and the two dates. Those are the only ones rendered. The
 * cost and the overall status are not in this payload, and defaulting them to
 * something would be inventing data the approver then decides on.
 */
export function ApprovalCard({ approval }: { approval: Approval }) {
  const travel = approval.travel;

  return (
    <Link
      href={`/approver/approvals/${approval.travelId}`}
      className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-caption text-tertiary">
            #{approval.travelId}
          </span>
          <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[11px] font-semibold text-on-primary-fixed">
            Tingkat {approval.level} •{" "}
            {APPROVAL_LEVEL_TITLE[approval.level] ?? "Persetujuan"}
          </span>
        </div>
        <p className="mt-1.5 truncate text-label-md font-semibold text-on-surface">
          {travel?.destination ?? "Tujuan tidak tersedia"}
        </p>
        <p className="truncate text-caption text-on-surface-variant">
          {travel?.purpose ?? "—"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption sm:justify-end">
        <div>
          <span className="block text-tertiary">Periode</span>
          <span className="text-on-surface">
            {travel?.startDate && travel?.endDate
              ? formatDateRange(travel.startDate, travel.endDate)
              : "—"}
          </span>
        </div>
        <div>
          <span className="block text-tertiary">Masuk antrean</span>
          <span className="text-on-surface">
            {approval.createdAt ? formatDateTime(approval.createdAt) : "—"}
          </span>
        </div>
        <span
          aria-hidden
          className="material-symbols-outlined shrink-0 text-outline"
          style={{ fontSize: 20 }}
        >
          chevron_right
        </span>
      </div>
    </Link>
  );
}
