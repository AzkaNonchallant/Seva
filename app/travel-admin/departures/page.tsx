import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DataTable, TableFooter } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { getBookingOverview, type DepartureRow } from "@/lib/api/report";
import { requireBookingManager } from "@/lib/auth";
import { formatDate, formatIDR, initials } from "@/lib/utils";
import { travelOwner } from "@/components/travel/travel-labels";

export const metadata = { title: "Monitoring Keberangkatan • Dinas Travel" };

/** Booking-status breadcrumb colour also carries the urgency signal here. */
type Horizon = "TODAY" | "WEEK" | "MONTH" | "ALL";

const HORIZON_LABEL: Record<Horizon, string> = {
  TODAY: "Hari ini",
  WEEK: "7 hari",
  MONTH: "30 hari",
  ALL: "Semua",
};

const WINDOW_DAYS: Record<Horizon, number> = {
  TODAY: 0,
  WEEK: 7,
  MONTH: 30,
  ALL: 3650,
};

const TYPE_LABEL: Record<DepartureRow["type"], string> = {
  FLIGHT: "Penerbangan",
  HOTEL: "Hotel",
  TRAIN: "Kereta",
  TRANSPORT: "Transportasi",
};

export default async function DeparturesPage({
  searchParams,
}: PageProps<"/travel-admin/departures">) {
  await requireBookingManager();

  const params = await searchParams;
  const horizon = (params.horizon as Horizon) || "WEEK";

  const [unread, overview] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    getBookingOverview(WINDOW_DAYS[horizon]),
  ]);

  // Already inside the window from the fetch; sorting puts the nearest first.
  const rows = overview.departures;
  const today = rows.filter((row) => row.daysUntilDeparture === 0);
  const unbooked = rows.filter(
    (row) => row.status === "PENDING" && row.daysUntilDeparture <= 2,
  );

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Monitoring Keberangkatan" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Monitoring Keberangkatan"
          description="Setiap keberangkatan dalam rentang waktu terpilih, diurutkan dari yang terdekat. Booking berstatus Menunggu lebih dari dua hari sebelum berangkat ditandai sebagai risiko."
        />

        {unbooked.length ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl bg-warning-container p-4"
          >
            <span className="material-symbols-outlined shrink-0 text-warning" style={{ fontSize: 20 }}>
              warning
            </span>
            <div>
              <p className="text-label-md font-bold text-warning">
                {unbooked.length} keberangkatan berisiko
              </p>
              <p className="mt-0.5 text-caption text-warning">
                Booking masih berstatus Menunggu kurang dari dua hari sebelum
                keberangkatan. Ikuti up ke supplier sebelum hari-H.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs<Horizon>
            ariaLabel="Pilih rentang waktu keberangkatan"
            paramName="horizon"
            value={horizon}
            options={(Object.keys(HORIZON_LABEL) as Horizon[]).map((value) => ({
              value,
              label: HORIZON_LABEL[value],
            }))}
          />
          {today.length ? (
            <p className="text-caption text-on-surface-variant">
              <span className="font-bold text-primary">{today.length}</span>{" "}
              keberangkatan hari ini
            </p>
          ) : null}
        </div>

        <Card>
          {rows.length ? (
            <>
              <DataTable
                rows={rows}
                rowKey={(row) => row.id}
                columns={[
                  {
                    key: "when",
                    header: "Keberangkatan",
                    cell: (row) => (
                      <div className="leading-tight">
                        <p className="font-semibold">
                          {row.daysUntilDeparture === 0
                            ? "Hari ini"
                            : `${row.daysUntilDeparture} hari lagi`}
                        </p>
                        <p className="text-caption text-tertiary">
                          {formatDate(row.departsOn)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "employee",
                    header: "Traveler",
                    cell: (row) => (
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary-container">
                          {initials(travelOwner(row.travel))}
                        </span>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-medium">
                            {travelOwner(row.travel)}
                          </p>
                          <p className="truncate text-caption text-tertiary">
                            {row.travel.user?.email ?? "—"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "leg",
                    header: "Pemesanan",
                    cell: (row) => (
                      <div className="leading-tight">
                        <p className="font-medium">
                          {row.description ?? TYPE_LABEL[row.type]}
                        </p>
                        <p className="text-caption text-tertiary">
                          {TYPE_LABEL[row.type]} • {row.provider ?? "—"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "booking",
                    header: "Status Booking",
                    cell: (row) => (
                      <div className="space-y-1">
                        <BookingStatusBadge status={row.status} />
                        {row.bookingCode ? (
                          <p className="font-mono text-caption text-tertiary">
                            {row.bookingCode}
                          </p>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    key: "travel",
                    header: "Pengajuan",
                    cell: (row) => (
                      <Link
                        href={`/travel-admin/requests/${row.travel.id}`}
                        className="text-caption font-semibold text-primary hover:underline"
                      >
                        #{row.travel.id}
                      </Link>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Nilai",
                    align: "right",
                    cell: (row) => (
                      <span className="font-medium">{formatIDR(row.amount)}</span>
                    ),
                  },
                ]}
              />
              <TableFooter from={1} to={rows.length} total={rows.length} />
            </>
          ) : (
            <EmptyState
              icon="flight_takeoff"
              title="Tidak ada keberangkatan"
              description={`Tidak ada booking dalam rentang ${HORIZON_LABEL[horizon].toLowerCase()}. Coba perpanjang horizon atau lengkapi booking yang masih Menunggu.`}
              action={
                <Link
                  href="/travel-admin/bookings/queue"
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Lihat antrean booking
                </Link>
              }
            />
          )}
        </Card>
      </main>
    </div>
  );
}
