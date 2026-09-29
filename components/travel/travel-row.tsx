import Link from "next/link";

import { TravelStatusBadge } from "@/components/ui/status-badge";
import { formatDateRange, formatIDR } from "@/lib/utils";

import type { TravelRequest } from "@/lib/api/types";

/**
 * One row of the employee's own travel list.
 *
 * A link to the detail page rather than an `onClick` handler, so the row has a
 * real href: middle-click, open-in-new-tab, and keyboard activation all work the
 * way they do for the Admin Travel booking rows.
 */
export function TravelRow({ travel }: { travel: TravelRequest }) {
  return (
    <Link
      href={`/employee/travel/${travel.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-caption text-tertiary">
            {travel.ref ?? `#${travel.id}`}
          </span>
          <TravelStatusBadge status={travel.status} />
        </div>
        <p className="mt-1.5 truncate text-label-md font-semibold text-on-surface">
          {travel.destination}
        </p>
        <p className="truncate text-caption text-on-surface-variant">
          {travel.purpose}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption sm:justify-end">
        <div>
          <span className="block text-tertiary">Periode</span>
          <span className="text-on-surface">
            {formatDateRange(travel.startDate, travel.endDate)}
          </span>
        </div>
        <div>
          <span className="block text-tertiary">Estimasi</span>
          <span className="text-on-surface">{formatIDR(travel.estimatedCost)}</span>
        </div>
        <span
          className="material-symbols-outlined shrink-0 text-outline"
          style={{ fontSize: 20 }}
        >
          chevron_right
        </span>
      </div>
    </Link>
  );
}
