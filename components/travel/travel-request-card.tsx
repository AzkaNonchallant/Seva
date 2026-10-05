"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CreateBookingModal } from "@/components/booking/create-booking-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { PendingTravel } from "@/lib/api/booking";
import { cn, daysUntil, formatDateRange, formatIDR, initials } from "@/lib/utils";
import { travelOwner } from "@/components/travel/travel-labels";

/**
 * How long a request has sat in the booking queue.
 *
 * The backend returns no `waitingHours`, so it is derived from `createdAt`. The
 * SLA ladder itself is unchanged from the Stitch reference: amber at 12h, red
 * past 24h.
 */
function waitingHoursFrom(createdAt?: string) {
  if (!createdAt) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 3_600_000));
}

/** SLA ladder from the Stitch reference: amber at 12h, red past 24h. */
function urgency(waitingHours: number) {
  if (waitingHours > 24) return { tone: "error" as const, label: "Terlambat" };
  if (waitingHours > 12) return { tone: "warning" as const, label: "Mendekati SLA" };
  return { tone: "neutral" as const, label: "Dalam SLA" };
}

export function TravelRequestCard({
  travel,
  showUrgency = true,
}: {
  travel: PendingTravel;
  showUrgency?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const days = daysUntil(travel.startDate);
  const waiting = waitingHoursFrom(travel.createdAt);
  const flag = showUrgency ? urgency(waiting) : null;

  return (
    <>
      <Card className="flex flex-col gap-md p-md transition-shadow hover:shadow-float lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-label-md font-bold text-primary">
              #{travel.id}
            </span>
            <Badge tone="success" dot>
              Disetujui
            </Badge>
            {flag ? (
              <Badge tone={flag.tone} icon="timer">
                Menunggu {waiting} jam • {flag.label}
              </Badge>
            ) : null}
          </div>

          <p className="text-body-md font-semibold text-on-surface">
            {travel.destination}{" "}
            <span className="font-normal text-on-surface-variant">
              • {countLabel(travel.startDate, travel.endDate)}
            </span>
          </p>
          <p className="mt-0.5 text-caption text-on-surface-variant">
            {travel.purpose}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-md">
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary-container">
                {initials(travelOwner(travel))}
              </span>
              <span className="text-caption text-on-surface">
                <span className="text-tertiary">{travelOwner(travel)}</span>
              </span>
            </div>
            <span className="flex items-center gap-1 text-caption text-tertiary">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                event
              </span>
              {formatDateRange(travel.startDate, travel.endDate)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 lg:flex-row lg:items-center">
          <div className="lg:text-right">
            <p className="text-caption text-tertiary">Estimasi</p>
            <p className="text-label-md font-bold text-on-surface">
              {formatIDR(travel.estimatedCost)}
            </p>
            <p
              className={cn(
                "text-[11px]",
                days <= 7 ? "font-semibold text-error" : "text-tertiary",
              )}
            >
              {days >= 0
                ? `${days} hari lagi`
                : `berakhir ${Math.abs(days)} hari lalu`}
            </p>
          </div>
          <Button
            variant="secondary"
            icon="add"
            onClick={() => setOpen(true)}
            className="w-full lg:w-auto"
          >
            Task Booking
          </Button>
        </div>
      </Card>

      {open ? (
        <CreateBookingModal
          travel={travel}
          onClose={() => setOpen(false)}
          onSaved={(message) => {
            setOpen(false);
            startTransition(() => router.refresh());
            window.dispatchEvent(
              new CustomEvent("app:toast", { detail: { message } }),
            );
          }}
        />
      ) : null}
    </>
  );
}

function countLabel(start: string, end: string) {
  const days =
    Math.round(
      (new Date(`${end}T00:00:00`).getTime() -
        new Date(`${start}T00:00:00`).getTime()) /
        86_400_000,
    ) + 1;
  return `${days} hari`;
}
