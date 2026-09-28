"use client";

import { useState, useTransition } from "react";

import { updateBookingStatusAction } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/ui/status-badge";

import type { Booking, BookingStatus } from "@/lib/api/types";

/**
 * Status controls. The spec exposes exactly PENDING / CONFIRMED / CANCELLED
 * on PATCH /api/travel/bookings/:id/status, so the button set is derived from
 * the row's current status rather than offered unconditionally.
 */
export function BookingStatusActions({
  booking,
  compact = false,
  onChanged,
}: {
  booking: Booking;
  compact?: boolean;
  onChanged?: (booking: Booking) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function moveTo(status: BookingStatus) {
    // Cancellation is destructive, so it always asks first.
    if (
      status === "CANCELLED" &&
      !window.confirm(
        `Batalkan booking ${booking.referenceNumber ?? booking.id}? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatusAction(
        booking.id,
        booking.travelId,
        status,
      );
      if (result.ok) onChanged?.(result.data);
      else setError(result.message);
    });
  }

  if (booking.status === "CANCELLED") {
    return (
      <div className="flex flex-col items-end gap-1">
        <BookingStatusBadge status={booking.status} />
        {error ? <ErrorText message={error} /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {booking.status === "PENDING" ? (
          <Button
            size="sm"
            variant="outline"
            icon="check_circle"
            disabled={pending}
            onClick={() => moveTo("CONFIRMED")}
          >
            {compact ? "" : "Konfirmasi"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            icon="undo"
            disabled={pending}
            onClick={() => moveTo("PENDING")}
            title="Kembalikan ke status menunggu"
          >
            {compact ? "" : "Batalkan konfirmasi"}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          icon="cancel"
          disabled={pending}
          onClick={() => moveTo("CANCELLED")}
          aria-label="Batalkan booking"
          title="Batalkan booking"
        />
      </div>
      {error ? <ErrorText message={error} /> : null}
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <p role="alert" className="max-w-[220px] text-right text-caption text-error">
      {message}
    </p>
  );
}
