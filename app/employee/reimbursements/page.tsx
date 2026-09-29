import Link from "next/link";

import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { NewReimbursementButton } from "@/components/reimbursement/new-reimbursement-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { listReimbursements } from "@/lib/api/reimbursement";
import { listTravels } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { formatDate, formatIDR, formatIDRCompact } from "@/lib/utils";

import type { Reimbursement, ReimbursementStatus } from "@/lib/api/types";

export const metadata = { title: "Reimbursement • Employee" };

const STATUS_FILTERS: Array<{ value: ReimbursementStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "PAID", label: "Dibayarkan" },
  { value: "REJECTED", label: "Ditolak" },
];

/**
 * The employee's own reimbursements.
 *
 * §5 gives Employee read access to their rows only, which is what the endpoint
 * already returns. The completed travels that have no reimbursement yet are
 * derived from `GET /api/travel`, because §5 only accepts a COMPLETED travel as
 * the basis for a new one.
 */
export default async function ReimbursementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["EMPLOYEE"]);
  const params = await searchParams;
  const status = (params.status as ReimbursementStatus | "ALL" | undefined) ?? "ALL";

  const [unread, all, travels] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listReimbursements()),
    listTravels().catch(() => []),
  ]);

  if (!all.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Reimbursement" },
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
  const counts = new Map<ReimbursementStatus | "ALL", number>();
  counts.set("ALL", rows.length);
  for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);

  const filtered =
    status === "ALL" ? rows : rows.filter((row) => row.status === status);

  const completed = travels.filter((travel) => travel.status === "COMPLETED");
  const claimed = new Set(
    rows.filter((row) => row.status !== "REJECTED").map((row) => row.travelId),
  );
  const claimable = completed.filter((travel) => !claimed.has(travel.id));

  const awaiting = rows.filter((row) => row.status === "SUBMITTED");
  const settled = rows.filter((row) => row.status === "PAID");
  const outstanding = rows
    .filter((row) => row.status === "APPROVED")
    .reduce((sum, row) => sum + Math.max(0, row.differenceAmount), 0);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Reimbursement" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Reimbursement"
          description="Laporan ganti biaya atas travel dinas Anda. Sumber data: GET /api/reimbursements, yang untuk role Employee hanya menampilkan reimbursement miliknya."
        />

        <section
          aria-label="Ringkasan reimbursement"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Draft"
            value={rows.filter((row) => row.status === "DRAFT").length}
            icon="edit_note"
            tone="neutral"
            footnote="Belum diajukan ke Finance"
          />
          <SummaryCard
            label="Menunggu Verifikasi"
            value={awaiting.length}
            icon="hourglass_top"
            tone="accent"
            footnote="Sedang diperiksa Finance"
          />
          <SummaryCard
            label="Sudah Dibayarkan"
            value={formatIDRCompact(
              settled.reduce((sum, row) => sum + row.approvedAmount, 0),
            )}
            icon="paid"
            tone="success"
            footnote={`${settled.length} reimbursement lunas`}
          />
          <SummaryCard
            label="Menunggu Pembayaran"
            value={formatIDRCompact(outstanding)}
            icon="account_balance_wallet"
            tone="primary"
            footnote="Disetujui, belum dibayarkan"
          />
        </section>

        {claimable.length ? (
          <Card>
            <div className="border-b border-outline-variant/20 p-md">
              <h2 className="text-body-lg font-semibold text-on-surface">
                Travel Selesai yang Belum Direimburse
              </h2>
              <p className="mt-0.5 text-caption text-on-surface-variant">
                API_SPEC hanya menerima reimbursement atas travel berstatus
                COMPLETED.
              </p>
            </div>
            <ul className="flex flex-col divide-y divide-outline-variant/15">
              {claimable.map((travel) => (
                <li key={travel.id} className="flex flex-wrap items-center gap-3 p-md">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-caption text-tertiary">
                      {travel.ref ?? `#${travel.id}`}
                    </p>
                    <p className="truncate text-body-md text-on-surface">
                      {travel.destination}
                    </p>
                    <p className="text-caption text-tertiary">
                      {formatDate(travel.startDate)} → {formatDate(travel.endDate)}
                    </p>
                  </div>
                  <NewReimbursementButton travelId={travel.id} />
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <FilterTabs<ReimbursementStatus | "ALL">
          ariaLabel="Saring menurut status reimbursement"
          paramName="status"
          value={status}
          options={STATUS_FILTERS.map((entry) => ({
            value: entry.value,
            label: entry.label,
            count: counts.get(entry.value) ?? 0,
          }))}
        />

        {filtered.length ? (
          <ul className="flex flex-col gap-3">
            {filtered.map((row) => (
              <ReimbursementRow key={row.id} reimbursement={row} />
            ))}
          </ul>
        ) : (
          <Card>
            {rows.length ? (
              <EmptyState
                icon="filter_alt_off"
                title="Tidak ada reimbursement yang cocok"
                description="Ubah saringan status untuk melihat yang lain."
                action={
                  <Link
                    href="/employee/reimbursements"
                    className="text-caption font-semibold text-primary hover:underline"
                  >
                    Reset saringan
                  </Link>
                }
              />
            ) : claimable.length ? (
              <EmptyState
                icon="receipt_long"
                title="Belum ada reimbursement"
                description="Buat reimbursement dari travel yang sudah selesai, pada daftar di atas."
              />
            ) : (
              <EmptyState
                icon="receipt_long"
                title="Belum ada reimbursement"
                description="Reimbursement dapat dibuat setelah travel Anda berstatus Selesai."
              />
            )}
          </Card>
        )}
      </main>
    </>
  );
}

function ReimbursementRow({ reimbursement }: { reimbursement: Reimbursement }) {
  return (
    <li>
      <Link
        href={`/employee/reimbursements/${reimbursement.id}`}
        className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float sm:flex-row sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-mono text-caption text-tertiary">
              {reimbursement.travelRef ?? `#${reimbursement.travelId}`}
            </span>
            <ReimbursementStatusBadge status={reimbursement.status} />
          </div>
          <p className="mt-1.5 text-label-md font-semibold text-on-surface">
            {formatIDR(reimbursement.totalAmount)}
          </p>
          <p className="text-caption text-tertiary">
            {reimbursement.submittedAt
              ? `Diajukan ${formatDate(reimbursement.submittedAt)}`
              : "Belum diajukan"}
            {reimbursement.paidAt ? ` • dibayar ${formatDate(reimbursement.paidAt)}` : ""}
          </p>
        </div>
        <span
          className="material-symbols-outlined shrink-0 text-outline"
          style={{ fontSize: 20 }}
        >
          chevron_right
        </span>
      </Link>
    </li>
  );
}


