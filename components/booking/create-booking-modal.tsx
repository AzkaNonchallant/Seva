"use client";

import { useEffect } from "react";

import { BookingForm } from "@/components/booking/booking-form";

import type { PendingTravel } from "@/lib/api/booking";
import { toNumber } from "@/lib/api/types";
import { countDays, formatDateRange } from "@/lib/utils";

/**
 * Level 3 elevation modal for `POST /api/travel/:travelId/bookings`.
 * Closes on Escape and on backdrop click, and locks background scroll.
 */
export function CreateBookingModal({
  travel,
  onClose,
  onSaved,
}: {
  travel: PendingTravel;
  onClose: () => void;
  onSaved?: (message: string) => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-md">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-booking-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-float sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 p-md">
          <div>
            <h2
              id="create-booking-title"
              className="text-[20px] font-semibold text-on-surface"
            >
              Buat Booking
            </h2>
            <p className="mt-0.5 text-caption text-on-surface-variant">
              Travel berstatus{" "}
              <span className="font-semibold text-success">APPROVED</span>{" "}
              • {countDays(travel.startDate, travel.endDate)} hari
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="overflow-y-auto">
          <BookingForm
            travelId={travel.id}
            travelLabel={travel.destination}
            destination={travel.destination}
            travelWindow={formatDateRange(travel.startDate, travel.endDate)}
            estimatedCost={toNumber(travel.estimatedCost)}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
