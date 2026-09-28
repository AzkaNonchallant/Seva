import { notFound } from "next/navigation";

import { ApprovalTimeline } from "@/components/travel/approval-timeline";
import { BookingRow } from "@/components/booking/booking-row";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header } from "@/components/layout/header";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { getApprovalTimeline } from "@/lib/api/approval";
import { listBookings } from "@/lib/api/booking";
import { fetchOrNotFound } from "@/lib/api/fetch-or-not-found";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravel } from "@/lib/api/travel";
import { requireBookingManager } from "@/lib/auth";
import { formatDate, formatDateRange, formatIDR } from "@/lib/utils";

import type { Booking } from "@/lib/api/types";

export const metadata = { title: "Detail Booking • Dinas Travel" };

/**
 * A missing travel is a 404, not a crash: the API raises `ApiError` with
 * `code: "NOT_FOUND"` and the nearest not-found boundary renders.
 */

/** One booking, addressed directly by `GET /api/travel/:travelId/bookings`. */
export default async function BookingDetailPage({
  params,
}: PageProps<"/travel-admin/bookings/[id]">) {
  await requireBookingManager();
  const { id } = await params;
  const travelId = Number(id);
  if (!Number.isFinite(travelId)) notFound();

  const [travel, bookings, approvals, unread] = await Promise.all([
    fetchOrNotFound(getTravel(travelId)),
    listBookings(travelId),
    getApprovalTimeline(travelId).catch(() => []),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Kelola Booking", href: "/travel-admin/bookings" },
          { label: travel.ref ?? `#${travel.id}` },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <TravelSummary travel={travel} />

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <div className="flex flex-col gap-md xl:col-span-2">
            <Card>
              <CardHeader
                title="Booking pada pengajuan ini"
                description={`${bookings.length} pemesanan tercatat • total ${formatIDR(
                  bookings.reduce((sum, b) => sum + b.amount, 0),
                )}`}
              />
              <CardBody className="space-y-3">
                {bookings.length ? (
                  bookings.map((booking: Booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      travel={travel}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="confirmation_number"
                    title="Belum ada booking"
                    description="Pengajuan ini disetujui tetapi belum dipesan. Tambahkan tiket atau hotel dari antrean booking."
                  />
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Riwayat Persetujuan"
              description="Urutan naik mengikuti tingkat persetujuan."
            />
            <ApprovalTimeline approvals={approvals} />
          </Card>
        </div>
      </main>
    </div>
  );
}

function TravelSummary({
  travel,
}: {
  travel: Awaited<ReturnType<typeof getTravel>>;
}) {
  return (
    <Card className="p-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-headline-md font-bold text-primary">
              {travel.ref}
            </h1>
            <TravelStatusBadge status={travel.status} />
          </div>
          <p className="text-body-lg font-semibold text-on-surface">
            {travel.destination}
          </p>
          <p className="mt-0.5 text-body-md text-on-surface-variant">
            {travel.purpose}
          </p>
        </div>
      </div>

      <dl className="mt-md grid grid-cols-2 gap-3 border-t border-outline-variant/15 pt-md lg:grid-cols-4">
        <Fact label="Pemohon" value={travel.employeeName} sub={travel.positionName} />
        <Fact label="Departemen" value={travel.departmentName ?? "—"} />
        <Fact
          label="Periode"
          value={formatDateRange(travel.startDate, travel.endDate)}
        />
        <Fact label="Estimasi" value={formatIDR(travel.estimatedCost)} />
        {travel.policyName ? (
          <Fact label="Kebijakan" value={travel.policyName} className="col-span-2" />
        ) : null}
        <Fact label="Diajukan" value={formatDate(travel.submittedAt ?? travel.createdAt)} />
      </dl>
    </Card>
  );
}

function Fact({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-caption text-tertiary">{label}</dt>
      <dd className="mt-0.5 text-label-md font-semibold text-on-surface">
        {value}
      </dd>
      {sub ? <dd className="text-caption text-tertiary">{sub}</dd> : null}
    </div>
  );
}
