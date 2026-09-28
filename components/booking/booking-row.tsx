"use client";

import Link from "next/link";
import { useState } from "react";

import { BookingStatusActions } from "@/components/booking/booking-status";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { Booking, TravelRequest } from "@/lib/api/types";
import { formatDateRange, formatIDR, initials } from "@/lib/utils";

const TYPE_LABEL: Record<Booking["type"], string> = {
  FLIGHT: "Penerbangan",
  HOTEL: "Hotel",
  TRAIN: "Kereta",
  TRANSPORT: "Transportasi",
};

const TYPE_ICON: Record<Booking["type"], string> = {
  FLIGHT: "flight",
  HOTEL: "hotel",
  TRAIN: "train",
  TRANSPORT: "directions_car",
};

/** Flights and trains need a return leg; a hotel needs check-in/check-out. */
function windowOf(booking: Booking) {
  if (booking.type === "HOTEL") {
    if (booking.checkInDate && booking.checkOutDate) {
      return formatDateRange(booking.checkInDate, booking.checkOutDate);
    }
  }
  if (booking.departureDate && booking.returnDate) {
    return formatDateRange(booking.departureDate, booking.returnDate);
  }
  return booking.departureDate
    ? formatDateRange(booking.departureDate, booking.departureDate)
    : "—";
}

function routeOf(booking: Booking) {
  if (booking.type === "HOTEL") {
    return booking.destination ?? booking.origin ?? "—";
  }
  if (booking.origin && booking.destination) {
    return `${booking.origin} → ${booking.destination}`;
  }
  return booking.destination ?? "—";
}

/**
 * One booking, with its parent travel request inlined.
 *
 * The row is the interaction surface for PATCH
 * /api/travel/bookings/:id/status, and links through to the owning request.
 */
export function BookingRow({
  booking,
  travel,
}: {
  booking: Booking;
  travel: TravelRequest;
}) {
  // Optimistic read of the status so the badge and buttons agree while the
  // server action is in flight; the revalidated payload replaces it after.
  const [status, setStatus] = useState(booking.status);
  const view = { ...booking, status };

  return (
    <Card className="p-md transition-shadow hover:shadow-float">
      <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {TYPE_ICON[booking.type]}
            </span>
          </span>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="text-label-md font-bold text-on-surface">
                {TYPE_LABEL[booking.type]}
              </span>
              <BookingStatusBadge status={status} />
              {booking.referenceNumber ? (
                <Badge tone="neutral" icon="tag">
                  {booking.referenceNumber}
                </Badge>
              ) : null}
            </div>

            <p className="text-body-md font-semibold text-on-surface">
              {routeOf(view)}
            </p>
            <p className="mt-0.5 text-caption text-on-surface-variant">
              {booking.provider ?? "Provider belum ditentukan"} • {windowOf(view)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/travel-admin/requests/${travel.id}`}
                className="flex items-center gap-1.5 rounded-full bg-surface-container-low py-1 pl-1 pr-2.5 text-caption transition-colors hover:bg-surface-container-high"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-[9px] font-bold text-on-primary-container">
                  {initials(travel.employeeName)}
                </span>
                <span className="text-on-surface">
                  {travel.employeeName}
                </span>
                <span className="font-mono text-[11px] text-tertiary">
                  {travel.ref}
                </span>
              </Link>
            </div>

            {booking.notes ? (
              <p className="mt-2 flex items-start gap-1.5 text-caption text-on-surface-variant">
                <span
                  className="material-symbols-outlined mt-px shrink-0 text-outline"
                  style={{ fontSize: 14 }}
                >
                  sticky_note_2
                </span>
                {booking.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-md border-t border-outline-variant/15 pt-3 lg:w-64 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-md lg:pt-0">
          <div className="lg:text-right">
            <p className="text-caption text-tertiary">Nilai</p>
            <p className="text-body-lg font-bold text-on-surface">
              {formatIDR(booking.amount)}
            </p>
          </div>
          <BookingStatusActions
            booking={view}
            onChanged={(updated) => setStatus(updated.status)}
          />
        </div>
      </div>
    </Card>
  );
}
