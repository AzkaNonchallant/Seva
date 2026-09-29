import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DataTable, TableFooter } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { SearchBar } from "@/components/ui/search-bar";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { loadTravelsWithBookings } from "@/lib/api/report";
import { requireBookingManager } from "@/lib/auth";
import { listTravels } from "@/lib/api/travel";
import { daysUntil, formatDateRange, formatIDR, initials } from "@/lib/utils";

import type { TravelRequest, TravelStatus } from "@/lib/api/types";

export const metadata = { title: "Travel Request • Dinas Travel" };

const PER_PAGE = 12;

type StatusFilter = "ALL" | TravelStatus;

const STATUS_LABEL: Record<StatusFilter, string> = {
  ALL: "Semua",
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
};

export default async function RequestsPage({
  searchParams,
}: PageProps<"/travel-admin/requests">) {
  await requireBookingManager();

  const params = await searchParams;
  const status = (params.status as StatusFilter) || "ALL";
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const [travels, unread] = await Promise.all([
    listTravels(),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  const bookingCount = await countBookingsPerTravel();

  const counts = travels.reduce(
    (acc, travel) => {
      acc.ALL += 1;
      acc[travel.status] += 1;
      return acc;
    },
    { ALL: 0 } as Record<StatusFilter, number>,
  );

  const filtered = travels
    .filter((travel) => status === "ALL" || travel.status === status)
    .filter((travel) =>
      query
        ? [travel.ref, travel.employeeName, travel.destination, travel.purpose]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(query as string),
            )
        : true,
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Travel Request" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Travel Request"
          description="Seluruh pengajuan dinas beserta status persetujuannya. Booking hanya dapat dibuat untuk pengajuan berstatus Disetujui."
        />

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs<StatusFilter>
            ariaLabel="Sarin menurut status pengajuan"
            paramName="status"
            value={status}
            options={(Object.keys(STATUS_LABEL) as StatusFilter[]).map(
              (value) => ({
                value,
                label: STATUS_LABEL[value],
                count: counts[value],
              }),
            )}
          />
          <SearchBar
            paramName="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
            placeholder="Cari nomor, nama, atau kota..."
            className="sm:w-80"
          />
        </div>

        <Card>
          {slice.length ? (
            <>
              {/* Wide tables scroll inside their own container rather than
                  widening the page on narrow viewports. */}
              <DataTable
                rows={slice}
                rowKey={(travel) => travel.id}
                columns={[
                  {
                    key: "ref",
                    header: "Nomor",
                    cell: (travel) => (
                      <Link
                        href={`/travel-admin/requests/${travel.id}`}
                        className="font-mono text-label-md font-semibold text-primary hover:underline"
                      >
                        {travel.ref}
                      </Link>
                    ),
                  },
                  {
                    key: "employee",
                    header: "Pemohon",
                    cell: (travel) => (
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary-container">
                          {initials(travel.employeeName)}
                        </span>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-medium">
                            {travel.employeeName}
                          </p>
                          <p className="truncate text-caption text-tertiary">
                            {travel.departmentName}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "destination",
                    header: "Tujuan & Periode",
                    cell: (travel) => (
                      <div className="leading-tight">
                        <p className="font-medium">{travel.destination}</p>
                        <p className="text-caption text-tertiary">
                          {formatDateRange(travel.startDate, travel.endDate)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "estimated",
                    header: "Estimasi",
                    align: "right",
                    cell: (travel) => (
                      <span className="font-medium">
                        {formatIDR(travel.estimatedCost)}
                      </span>
                    ),
                  },
                  {
                    key: "bookings",
                    header: "Booking",
                    align: "right",
                    cell: (travel) => {
                      const count = bookingCount.get(travel.id) ?? 0;
                      return count ? (
                        <Link
                          href={`/travel-admin/bookings/${travel.id}`}
                          className="text-caption font-semibold text-primary hover:underline"
                        >
                          {count} pemesanan
                        </Link>
                      ) : (
                        <span className="text-caption text-tertiary">Belum ada</span>
                      );
                    },
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (travel) => (
                      <div className="space-y-1">
                        <TravelStatusBadge status={travel.status} />
                        <DepartureHint travel={travel} />
                      </div>
                    ),
                  },
                ]}
              />
              <TableFooter
                from={(current - 1) * PER_PAGE + 1}
                to={Math.min(current * PER_PAGE, filtered.length)}
                total={filtered.length}
              />
            </>
          ) : travels.length ? (
            <EmptyState
              icon="filter_alt_off"
              title="Tidak ada pengajuan yang cocok"
              description="Ubah status atau kata kunci untuk melihat pengajuan lain."
              action={
                <Link
                  href="/travel-admin/requests"
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Reset saringan
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon="assignment"
              title="Belum ada pengajuan"
              description="Pengajuan dinas dibuat oleh karyawan. Anis yang muncul di sini setelah dikirim ke atasan langsung."
            />
          )}
        </Card>
      </main>
    </div>
  );
}

function DepartureHint({ travel }: { travel: TravelRequest }) {
  if (travel.status !== "APPROVED") return null;
  const days = daysUntil(travel.startDate);
  return (
    <p className="text-caption text-tertiary">
      {days >= 0 ? `Berangkat ${days} hari lagi` : "Sudah lewat"}
    </p>
  );
}

async function countBookingsPerTravel() {
  const rows = await loadTravelsWithBookings();
  const counts = new Map<number, number>();
  for (const { travel, bookings } of rows) {
    if (bookings.length) counts.set(travel.id, bookings.length);
  }
  return counts;
}
