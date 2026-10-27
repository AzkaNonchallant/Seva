import Link from "next/link";

import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { listReimbursements } from "@/lib/api/reimbursement";
import { settle } from "@/lib/api/api";
import { requireBookingManager } from "@/lib/auth";
import { toNumber } from "@/lib/api/types";
import { formatDate, formatIDR, formatIDRCompact } from "@/lib/utils";

import type { Reimbursement, ReimbursementStatus } from "@/lib/api/types";

export const metadata = { title: "Reimbursement • Dinas Travel" };

const STATUS_FILTERS: Array<{
  value: ReimbursementStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "PAID", label: "Dibayarkan" },
  { value: "REJECTED", label: "Ditolak" },
];

/**
 * Read-only reimbursement monitoring for Admin Perjalanan Dinas.
 *
 * The backend lets this role read the reimbursement collection, but reserves
 * detail access and verify/pay transitions for Finance. The page therefore
 * exposes operational visibility without presenting an action the API rejects.
 */
export default async function TravelAdminReimbursementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireBookingManager();
  const params = await searchParams;
  const requestedStatus = typeof params.status === "string" ? params.status : "ALL";
  const status = STATUS_FILTERS.some((entry) => entry.value === requestedStatus)
    ? (requestedStatus as ReimbursementStatus | "ALL")
    : "ALL";

  const [unread, result] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listReimbursements()),
  ]);

  const header = (
    <Header
      breadcrumb={[
        { label: "Dinas Travel", href: "/travel-admin/dashboard" },
        { label: "Reimbursement" },
      ]}
      unreadCount={unread.count}
      notificationsHref="/travel-admin/notifications"
      profileHref="/travel-admin/profile"
    />
  );

  if (!result.ok) {
    return (
      <>
        {header}
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader
            title="Reimbursement"
            description="Pantau laporan ganti biaya yang terkait dengan perjalanan dinas."
          />
          <ErrorState error={result.error} />
        </main>
      </>
    );
  }

  const rows = result.data;
  const filtered = status === "ALL" ? rows : rows.filter((row) => row.status === status);
  const awaiting = rows.filter((row) => row.status === "SUBMITTED");
  const paid = rows.filter((row) => row.status === "PAID");
  const paidAmount = paid.reduce((sum, row) => sum + toNumber(row.approvedAmount), 0);

  return (
    <>
      {header}
      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Reimbursement"
          description="Pantau status dan nominal reimbursement dari pengajuan travel. Verifikasi dan pembayaran dilakukan oleh Finance."
        />

        <section
          aria-label="Ringkasan reimbursement"
          className="grid grid-cols-1 gap-md sm:grid-cols-3"
        >
          <SummaryCard
            label="Total laporan"
            value={rows.length}
            icon="receipt_long"
            tone="primary"
            footnote="Data yang terlihat oleh role ini"
          />
          <SummaryCard
            label="Menunggu Finance"
            value={awaiting.length}
            icon="hourglass_top"
            tone="accent"
            footnote="Belum selesai diverifikasi"
          />
          <SummaryCard
            label="Sudah dibayarkan"
            value={formatIDRCompact(paidAmount)}
            icon="paid"
            tone="success"
            footnote={`${paid.length} laporan lunas`}
          />
        </section>

        <FilterTabs<ReimbursementStatus | "ALL">
          ariaLabel="Saring reimbursement berdasarkan status"
          paramName="status"
          value={status}
          options={STATUS_FILTERS.map((entry) => ({
            value: entry.value,
            label: entry.label,
            count: rows.filter((row) => entry.value === "ALL" || row.status === entry.value).length,
          }))}
        />

        {filtered.length ? (
          <ul className="flex flex-col gap-3">
            {filtered.map((reimbursement) => (
              <ReimbursementRow key={reimbursement.id} reimbursement={reimbursement} />
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon="receipt_long"
              title={rows.length ? "Tidak ada reimbursement yang cocok" : "Belum ada reimbursement"}
              description={
                rows.length
                  ? "Ubah saringan status untuk melihat laporan lainnya."
                  : "Laporan reimbursement yang dapat dilihat role ini akan muncul di sini."
              }
            />
          </Card>
        )}
      </main>
    </>
  );
}

function ReimbursementRow({ reimbursement }: { reimbursement: Reimbursement }) {
  const travel = reimbursement.travel;
  const owner = travel?.user?.name ?? "Pemohon tidak tersedia";

  return (
    <li className="rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-caption text-tertiary">#{reimbursement.id}</span>
            <ReimbursementStatusBadge status={reimbursement.status} />
          </div>
          <p className="mt-1.5 truncate text-label-md font-semibold text-on-surface">
            {travel?.destination ?? `Travel #${reimbursement.travelId}`}
          </p>
          <p className="truncate text-caption text-on-surface-variant">{owner}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-caption sm:justify-end">
          <div>
            <span className="block text-tertiary">Total pengajuan</span>
            <span className="text-on-surface">{formatIDR(reimbursement.totalAmount)}</span>
          </div>
          <div>
            <span className="block text-tertiary">Diajukan</span>
            <span className="text-on-surface">
              {reimbursement.submittedAt ? formatDate(reimbursement.submittedAt) : "Belum diajukan"}
            </span>
          </div>
          {travel ? (
            <Link
              href={`/travel-admin/requests/${travel.id}`}
              className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-primary hover:bg-primary-fixed/30"
            >
              Lihat travel
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
