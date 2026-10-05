import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { bookingTypeLabel, travelOwner } from "@/components/travel/travel-labels";
import { formatDate, formatIDR } from "@/lib/utils";

import type { Booking, TravelRequest } from "@/lib/api/types";

/**
 * One booking, shown next to the travel request that owns it.
 *
 * The backend stores a booking as a provider, a confirmation code, one date and
 * a free-text description, so the origin/destination and per-night date range the
 * older spec described are not available and are not shown.
 */
export function BookingRow({
  booking,
  travel,
}: {
  booking: Booking;
  travel: TravelRequest;
}) {
  const when = booking.bookingDate ? formatDate(booking.bookingDate) : null;

  return (
    <Link
      href={`/travel-admin/bookings/${booking.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" variant="outline">
            {bookingTypeLabel(booking.type)}
          </Badge>
          <BookingStatusBadge status={booking.status} />
          {booking.bookingCode ? (
            <span className="font-mono text-caption text-tertiary">
              {booking.bookingCode}
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 truncate text-label-md font-semibold text-on-surface">
          {booking.description || bookingTypeLabel(booking.type)}
        </p>

        <p className="truncate text-caption text-on-surface-variant">
          {travelOwner(travel)}
          {booking.provider ? ` • ${booking.provider}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption sm:justify-end">
        {when ? (
          <div>
            <span className="block text-tertiary">Tanggal</span>
            <span className="text-on-surface">{when}</span>
          </div>
        ) : null}
        <div>
          <span className="block text-tertiary">Nilai</span>
          <span className="text-on-surface">{formatIDR(booking.amount)}</span>
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