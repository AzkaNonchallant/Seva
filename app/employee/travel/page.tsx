import Link from "next/link";

import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { SearchBar } from "@/components/ui/search-bar";
import { TravelRow } from "@/components/travel/travel-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { listTravels } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { formatIDR } from "@/lib/utils";

import type { TravelStatus } from "@/lib/api/types";

export const metadata = { title: "Pengajuan Travel • Employee" };

const STATUS_FILTERS: Array<{ value: TravelStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Diajukan" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

/**
 * The employee's own requests.
 *
 * §3 scopes `GET /api/travel` to the caller's rows for an Employee, so this
 * list needs no extra filtering — and the backend is the only thing that
 * decides which rows exist.
 */
export default async function EmployeeTravelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["EMPLOYEE"]);
  const params = await searchParams;

  const status = (params.status as TravelStatus | "ALL" | undefined) ?? "ALL";
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const [unread, all] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listTravels()),
  ]);

  if (!all.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Pengajuan Travel" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={all.error} />
        </main>
      </>
    );
  }

  const rows = all.data;
  const counts = new Map<TravelStatus | "ALL", number>();
  counts.set("ALL", rows.length);
  for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);

  const filtered = rows.filter((row) => {
    if (status !== "ALL" && row.status !== status) return false;
    if (!query) return true;
    return [row.ref, row.destination, row.purpose]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const drafts = rows.filter((row) => row.status === "DRAFT");
  const waiting = rows.filter((row) => row.status === "SUBMITTED");
  const approved = rows.filter((row) => row.status === "APPROVED");

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Pengajuan Travel" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Pengajuan Travel"
          description="Seluruh pengajuan dinas milik Anda. Sumber data: GET /api/travel, yang untuk role Employee hanya mengembalikan pengajuan miliknya sendiri."
          actions={
            <Link
              href="/employee/travel/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Pengajuan Baru
            </Link>
          }
        />

        <section
          aria-label="Ringkasan pengajuan"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Draft"
            value={drafts.length}
            icon="edit_note"
            tone="neutral"
            footnote="Belum dikirim ke atasan"
          />
          <SummaryCard
            label="Menunggu Persetujuan"
            value={waiting.length}
            icon="hourglass_top"
            tone="accent"
            footnote="Sedang berjalan di rantai approval"
          />
          <SummaryCard
            label="Disetujui"
            value={approved.length}
            icon="check_circle"
            tone="success"
            footnote="Menunggu penugasan booking"
          />
          <SummaryCard
            label="Total Estimasi"
            value={formatIDR(approved.reduce((sum, row) => sum + row.estimatedCost, 0))}
            icon="payments"
            tone="primary"
            footnote="Akumulasi pengajuan disetujui"
          />
        </section>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs<TravelStatus | "ALL">
            ariaLabel="Saring menurut status pengajuan"
            paramName="status"
            value={status}
            options={STATUS_FILTERS.map((entry) => ({
              value: entry.value,
              label: entry.label,
              count: counts.get(entry.value) ?? 0,
            }))}
          />
          <SearchBar
            paramName="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
            placeholder="Cari tujuan atau nomor..."
            className="sm:w-72"
          />
        </div>

        {filtered.length ? (
          <ul className="flex flex-col gap-3">
            {filtered.map((travel) => (
              <li key={travel.id}>
                <TravelRow travel={travel} />
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            {rows.length ? (
              <EmptyState
                icon="filter_alt_off"
                title="Tidak ada pengajuan yang cocok"
                description="Ubah saringan status atau kata kunci untuk melihat pengajuan lain."
                action={
                  <Link
                    href="/employee/travel"
                    className="text-caption font-semibold text-primary hover:underline"
                  >
                    Reset saringan
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon="flight_takeoff"
                title="Belum ada pengajuan"
                description="Mulai dengan membuat draft pengajuan travel dinas pertama Anda."
                action={
                  <Link
                    href="/employee/travel/new"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      add
                    </span>
                    Buat Pengajuan
                  </Link>
                }
              />
            )}
          </Card>
        )}
      </main>
    </>
  );
}
