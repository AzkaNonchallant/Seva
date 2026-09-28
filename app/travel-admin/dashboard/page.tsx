import Link from "next/link";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header, PageHeader } from "@/components/layout/header";
import { SummaryCard } from "@/components/ui/summary-card";
import { TravelRequestCard } from "@/components/travel/travel-request-card";
import { listPendingBookings } from "@/lib/api/booking";
import { getUnreadCount } from "@/lib/api/notification";
import { getBookingOverview } from "@/lib/api/report";
import { requireBookingManager } from "@/lib/auth";
import { formatIDRCompact } from "@/lib/utils";

import type { BookingStatus } from "@/lib/api/types";

export const metadata = { title: "Dashboard • Dinas Travel" };

const STATUS_META: Record<BookingStatus, { label: string; bar: string }> = {
  PENDING: { label: "Menunggu", bar: "bg-warning" },
  CONFIRMED: { label: "Terkonfirmasi", bar: "bg-primary" },
  CANCELLED: { label: "Dibatalkan", bar: "bg-error" },
};

export default async function DashboardPage() {
  const user = await requireBookingManager();

  const [queue, unread, { breakdown, confirmedValue, total, departures }] =
    await Promise.all([
      listPendingBookings(),
      getUnreadCount(),
      getBookingOverview(7),
    ]);

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Dinas Travel"
          description="Antrean penugasan booking untuk pengajuan yang telah disetujui, dan pemantauan keberangkatan karyawan."
          actions={
            <Link
              href="/travel-admin/bookings/queue"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-secondary-container px-md text-label-md font-semibold text-on-secondary-container shadow-ambient transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                pending_actions
              </span>
              Buka Antrean
            </Link>
          }
        />

        <section
          aria-label="Ringkasan operasional"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Menunggu Booking"
            value={queue.length}
            icon="pending_actions"
            tone="accent"
            footnote="Pengajuan APPROVED tanpa booking"
            href="/travel-admin/bookings/queue"
          />
          <SummaryCard
            label="Booking Terkonfirmasi"
            value={breakdown.CONFIRMED}
            icon="task_alt"
            tone="success"
            footnote="Tiket & hotel sudah terbit"
            href="/travel-admin/bookings?status=CONFIRMED"
          />
          <SummaryCard
            label="Keberangkatan Mendatang"
            value={departures.length}
            icon="travel_explore"
            tone="neutral"
            footnote="7 hari ke depan"
            href="/travel-admin/departures"
          />
          <SummaryCard
            label="Realisasi Booking"
            value={formatIDRCompact(confirmedValue)}
            icon="payments"
            tone="primary"
            footnote="Nilai tiket & hotel terbit"
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title="Antrean Penugasan Booking"
              description="Pengajuan APPROVED yang belum memiliki satu pun booking."
              action={
                <Link
                  href="/travel-admin/bookings/queue"
                  className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
                >
                  Lihat semua
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {queue.slice(0, 3).map((travel) => (
                <TravelRequestCard key={travel.id} travel={travel} />
              ))}
              {!queue.length ? (
                <EmptyState
                  icon="task_alt"
                  title="Antrean bersih"
                  description="Semua pengajuan yang disetujui sudah ditugaskan."
                />
              ) : null}
            </CardBody>
          </Card>

          <div className="flex flex-col gap-md">
            <Card>
              <CardHeader title="Sebaran Status Booking" />
              <CardBody className="space-y-3">
                {(Object.keys(STATUS_META) as BookingStatus[]).map((status) => {
                  const count = breakdown[status];
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-caption text-on-surface-variant">
                          {STATUS_META[status].label}
                        </span>
                        <span className="text-label-md font-bold text-on-surface">
                          {count}{" "}
                          <span className="text-caption font-normal text-tertiary">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                        <div
                          className={`h-full rounded-full ${STATUS_META[status].bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      timer
                    </span>
                  </span>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">
                      Target Penyelesaian
                    </h3>
                    <p className="mt-1 text-caption leading-relaxed text-on-surface-variant">
                      Tiket domestik harus terbit maksimal{" "}
                      <strong className="text-on-surface">2×24 jam</strong> sejak
                      pengajuan masuk antrean, hotel di luar Jawa{" "}
                      <strong className="text-on-surface">3×24 jam</strong>.
                    </p>
                  </div>
                </div>
                <div className="mt-md rounded-lg bg-surface-container-low p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-on-surface-variant">
                      Rata-rata waktu terbit
                    </span>
                    <span className="text-label-md font-bold text-primary">18 jam</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-[62%] rounded-full bg-primary" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <p className="text-caption text-tertiary">
          Masuk sebagai {user.name} • {user.email}
        </p>
      </main>
    </div>
  );
}
