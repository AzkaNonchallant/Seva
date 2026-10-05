import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { SearchBar } from "@/components/ui/search-bar";
import { TravelRequestCard } from "@/components/travel/travel-request-card";
import { listPendingBookings } from "@/lib/api/booking";
import { getUnreadCount } from "@/lib/api/notification";
import { requireBookingManager } from "@/lib/auth";
import { daysUntil } from "@/lib/utils";

import type { PendingTravel } from "@/lib/api/booking";
import { travelOwner } from "@/components/travel/travel-labels";

export const metadata = { title: "Antrean Booking • Dinas Travel" };

type Window = "ALL" | "TODAY" | "WEEK";

const WINDOW_LABEL: Record<Window, string> = {
  ALL: "Semua",
  TODAY: "Berangkat ≤ 3 hari",
  WEEK: "Berangkat ≤ 7 hari",
};

export default async function QueuePage({
  searchParams,
}: PageProps<"/travel-admin/bookings/queue">) {
  await requireBookingManager();

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const window = (params.window as Window) || "ALL";

  const [queue, unread] = await Promise.all([
    listPendingBookings(),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  const counts = countByWindow(queue);
  const rows = applyFilters(queue, query, window);

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Antrean Booking" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Antrean Penugasan Booking"
          description="Setiap pengajuan di sini sudah disetujui seluruh tingkat persetujuan tetapi belum memiliki satu pun booking. Urutan mengikuti waktu tunggu — yang terlama diantre paling atas."
        />

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs<Window>
            ariaLabel="Saring antrean menurut jarak keberangkatan"
            paramName="window"
            value={window}
            options={(Object.keys(WINDOW_LABEL) as Window[]).map((value) => ({
              value,
              label: WINDOW_LABEL[value],
              count: counts[value],
            }))}
          />
          <SearchBar
            paramName="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
            placeholder="Cari nama, kota, atau nomor..."
            className="sm:w-80"
          />
        </div>

        {rows.length ? (
          <ul className="flex flex-col gap-3">
            {rows.map((travel) => (
              <li key={travel.id}>
                <TravelRequestCard travel={travel} />
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            {queue.length ? (
              <EmptyState
                icon="filter_alt_off"
                title="Tidak ada antrean yang cocok"
                description="Ubah kata kunci atau saringan jarak keberangkatan untuk melihat antrean lain."
                action={
                  <Link
                    href="/travel-admin/bookings/queue"
                    className="text-caption font-semibold text-primary hover:underline"
                  >
                    Reset saringan
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon="task_alt"
                title="Antrean bersih"
                description="Semua pengajuan yang telah disetujui sudah ditugaskan. Antrean baru akan muncul begitu ada travel berstatus APPROVED tanpa booking."
              />
            )}
          </Card>
        )}
      </main>
    </div>
  );
}

/**
 * Oldest wait first — the row most likely to breach SLA should lead.
 *
 * The backend returns no `waitingHours`, so it is derived from `createdAt`.
 */
function waitingHoursOf(travel: PendingTravel) {
  if (!travel.createdAt) return 0;
  return Math.max(
    0,
    Math.round((Date.now() - new Date(travel.createdAt).getTime()) / 3_600_000),
  );
}

function sortByWaiting(rows: PendingTravel[]) {
  return [...rows].sort((a, b) => {
    const diff = waitingHoursOf(b) - waitingHoursOf(a);
    if (diff !== 0) return diff;
    return a.startDate.localeCompare(b.startDate);
  });
}

function countByWindow(rows: PendingTravel[]) {
  const counts: Record<Window, number> = { ALL: rows.length, TODAY: 0, WEEK: 0 };
  for (const travel of rows) {
    if (daysUntil(travel.startDate) <= 3) counts.TODAY += 1;
    if (daysUntil(travel.startDate) <= 7) counts.WEEK += 1;
  }
  return counts;
}

function applyFilters(rows: PendingTravel[], query: string, window: Window) {
  let filtered = sortByWaiting(rows);

  if (query) {
    filtered = filtered.filter((travel) =>
      [String(travel.id), travelOwner(travel), travel.destination, travel.purpose]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  if (window === "TODAY") {
    filtered = filtered.filter((travel) => daysUntil(travel.startDate) <= 3);
  } else if (window === "WEEK") {
    filtered = filtered.filter((travel) => daysUntil(travel.startDate) <= 7);
  }

  return filtered;
}
