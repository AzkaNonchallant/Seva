import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { BookingRow } from "@/components/booking/booking-row";
import { Pagination } from "@/components/data-table/pagination";
import { SearchBar } from "@/components/ui/search-bar";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { loadBookingsWithTravel, summariseBookings } from "@/lib/api/report";
import { requireBookingManager } from "@/lib/auth";
import { formatIDR, formatIDRCompact } from "@/lib/utils";

import type { Booking, BookingStatus } from "@/lib/api/types";

export const metadata = { title: "Kelola Booking • Dinas Travel" };

const PER_PAGE = 10;

type StatusFilter = "ALL" | BookingStatus;

const STATUS_LABEL: Record<StatusFilter, string> = {
  ALL: "Semua",
  PENDING: "Menunggu",
  CONFIRMED: "Terkonfirmasi",
  CANCELLED: "Dibatalkan",
};

const TYPE_LABEL: Record<Booking["type"], string> = {
  FLIGHT: "Penerbangan",
  HOTEL: "Hotel",
  TRAIN: "Kereta",
  TRANSPORT: "Transportasi",
};

export default async function BookingsPage({
  searchParams,
}: PageProps<"/travel-admin/bookings">) {
  await requireBookingManager();

  const params = await searchParams;
  const status = (params.status as StatusFilter) || "ALL";
  const type = (params.type as Booking["type"] | undefined) ?? null;
  const query =
    typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number(params.page) || 1);

  // One load, summarised twice: the counts for the filter tabs come from the
  // full set so a tab shows how many rows it would yield, not how many are on
  // this page.
  const [unread, all] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    loadBookingsWithTravel(),
  ]);
  const { breakdown, confirmedValue } = summariseBookings(all);

  const filtered = applyFilters(all, { status, type, query });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const statusCounts: Record<StatusFilter, number> = {
    ALL: all.length,
    PENDING: breakdown.PENDING,
    CONFIRMED: breakdown.CONFIRMED,
    CANCELLED: breakdown.CANCELLED,
  };

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Kelola Booking" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Kelola Booking"
          description="Seluruh tiket dan hotel yang pernah dibuat untuk pengajuan dinas. Ubah status melalui PATCH /api/travel/bookings/:id/status — hanya Menunggu, Terkonfirmasi, dan Dibatalkan yang tersedia."
        />

        <section
          aria-label="Ringkasan nilai booking"
          className="grid grid-cols-1 gap-md sm:grid-cols-3"
        >
          <SummaryCard
            label="Total Booking"
            value={all.length}
            icon="confirmation_number"
            tone="neutral"
            footnote="Seluruh jenis pemesanan"
          />
          <SummaryCard
            label="Menunggu Konfirmasi"
            value={breakdown.PENDING}
            icon="hourglass_top"
            tone="accent"
            footnote="Perlu ditindaklanjuti supplier"
          />
          <SummaryCard
            label="Nilai Terkonfirmasi"
            value={formatIDRCompact(confirmedValue)}
            icon="paid"
            tone="success"
            footnote={`${breakdown.CONFIRMED} booking terbit`}
          />
        </section>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FilterTabs<StatusFilter>
              ariaLabel="Saring menurut status booking"
              paramName="status"
              value={status}
              options={(Object.keys(STATUS_LABEL) as StatusFilter[]).map(
                (value) => ({
                  value,
                  label: STATUS_LABEL[value],
                  count: statusCounts[value],
                }),
              )}
            />
            <FilterTabs<Booking["type"] | "ALL">
              ariaLabel="Saring menurut jenis booking"
              paramName="type"
              value={type ?? "ALL"}
              options={[
                { value: "ALL", label: "Semua jenis" },
                ...(
                  Object.keys(TYPE_LABEL) as Booking["type"][]
                ).map((value) => ({ value, label: TYPE_LABEL[value] })),
              ]}
            />
          </div>
          <SearchBar
            paramName="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
            placeholder="Cari PNR,(employee, atau kota..."
            className="sm:w-72"
          />
        </div>

        {slice.length ? (
          <>
            <ul className="flex flex-col gap-3">
              {slice.map((booking) => (
                <li key={booking.id}>
                  <BookingRow booking={booking} travel={booking.travel} />
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <Card>
                <Pagination
                  page={current}
                  perPage={PER_PAGE}
                  total={filtered.length}
                />
              </Card>
            ) : null}
          </>
        ) : (
          <Card>
            {all.length ? (
              <EmptyState
                icon="filter_alt_off"
                title="Tidak ada booking yang cocok"
                description="Ubah saringan status, jenis, atau kata kunci untuk melihat booking lain."
                action={
                  <Link
                    href="/travel-admin/bookings"
                    className="text-caption font-semibold text-primary hover:underline"
                  >
                    Reset saringan
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon="confirmation_number"
                title="Belum ada booking"
                description="Booking dibuat dari antrean travel yang sudah disetujui. Buka antrean untuk mulai membuat pemesanan pertama."
                action={
                  <Link
                    href="/travel-admin/bookings/queue"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-secondary-container px-md text-label-md font-semibold text-on-secondary-container"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      pending_actions
                    </span>
                    Buka Antrean
                  </Link>
                }
              />
            )}
          </Card>
        )}

        {filtered.length ? (
          <p className="text-caption text-tertiary">
            Total nilai {status === "CONFIRMED" ? "terkonfirmasi" : "terfilter"}:{" "}
            {formatIDR(filtered.reduce((sum, row) => sum + row.amount, 0))}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function applyFilters(
  rows: Awaited<ReturnType<typeof loadBookingsWithTravel>>,
  filters: {
    status: StatusFilter;
    type: Booking["type"] | null;
    query: string;
  },
) {
  return rows.filter((row) => {
    if (filters.status !== "ALL" && row.status !== filters.status) return false;
    if (filters.type && row.type !== filters.type) return false;
    if (!filters.query) return true;

    return [row.referenceNumber, row.provider, row.travel.employeeName, row.travel.ref, row.destination]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(filters.query));
  });
}
