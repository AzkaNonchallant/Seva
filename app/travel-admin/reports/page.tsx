import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header, PageHeader } from "@/components/layout/header";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import {
  getBookingOverview,
  getDashboardReport,
  getExpenseByDepartment,
} from "@/lib/api/report";
import { requireBookingManager } from "@/lib/auth";
import { formatIDR, formatIDRCompact } from "@/lib/utils";

export const metadata = { title: "Laporan • Dinas Travel" };

export default async function ReportsPage() {
  await requireBookingManager();

  const [unread, summary, { breakdown, confirmedValue, total }, byDepartment] =
    await Promise.all([
      getUnreadCount().catch(() => ({ count: 0 })),
      getDashboardReport(),
      getBookingOverview(7),
      getExpenseByDepartment(),
    ]);

  const grandTotal = byDepartment.reduce((sum, row) => sum + row.total, 0);
  const completedShare = summary.total
    ? Math.round((summary.completed / summary.total) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Laporan" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Laporan Perjalanan Dinas"
          description="Ringkasan dari GET /api/reports. Seluruh angka berasal dari endpoint laporan di API_SPEC, bukan perhitungan di sisi antarmuka."
        />

        <section
          aria-label="Ringkasan perjalanan"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Sedang Berlangsung"
            value={summary.ongoing}
            icon="flight"
            tone="primary"
            footnote="Travel di dalam rentang tanggal hari ini"
          />
          <SummaryCard
            label="Akan Datang"
            value={summary.upcoming}
            icon="event_upcoming"
            tone="neutral"
            footnote="Disetujui, belum berangkat"
          />
          <SummaryCard
            label="Selesai"
            value={summary.completed}
            icon="task_alt"
            tone="success"
            footnote={`Realisasi ${completedShare}% dari total`}
          />
          <SummaryCard
            label="Total Pengajuan"
            value={summary.total}
            icon="summarize"
            tone="neutral"
            footnote="Seluruh status"
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-2">
          <Card>
            <CardHeader
              title="Realisasi Booking"
              description="Nilai booking yang sudah berstatus Terkonfirmasi."
            />
            <CardBody>
              <p className="text-headline-lg font-bold tracking-tight text-on-surface">
                {formatIDR(confirmedValue)}
              </p>
              <div className="mt-md grid grid-cols-3 gap-3">
                <Metric label="Menunggu" value={`${breakdown.PENDING}`} />
                <Metric label="Terkonfirmasi" value={`${breakdown.CONFIRMED}`} />
                <Metric label="Dibatalkan" value={`${breakdown.CANCELLED}`} />
              </div>
              <p className="mt-3 text-caption text-tertiary">
                Dari {total} booking yang tercatat.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Pengeluaran per Departemen"
              description="Hanya booking terkonfirmasi yang dihitung sebagai realisasi."
            />
            <CardBody>
              {byDepartment.length ? (
                <>
                  <ul className="space-y-3">
                    {byDepartment.map((row) => {
                      const pct = grandTotal
                        ? Math.round((row.total / grandTotal) * 100)
                        : 0;
                      return (
                        <li key={row.department}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="truncate text-caption text-on-surface-variant">
                              {row.department}
                            </span>
                            <span className="shrink-0 text-label-md font-bold text-on-surface">
                              {formatIDRCompact(row.total)}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                            <div
                              className="h-full rounded-full bg-primary-container"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-md border-t border-outline-variant/15 pt-3 text-caption text-tertiary">
                    Total {formatIDR(grandTotal)} dari{" "}
                    {byDepartment.length} departemen.
                  </p>
                </>
              ) : (
                <EmptyState
                  icon="analytics"
                  title="Belum ada pengeluaran"
                  description="Laporan muncul setelah ada booking berstatus Terkonfirmasi."
                />
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-3">
      <p className="text-caption text-tertiary">{label}</p>
      <p className="mt-0.5 text-headline-md font-bold text-on-surface">{value}</p>
    </div>
  );
}
