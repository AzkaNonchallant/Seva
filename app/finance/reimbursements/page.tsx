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
import { requireRole } from "@/lib/auth";
import { toNumber, type Reimbursement, type ReimbursementStatus } from "@/lib/api/types";
import { formatIDR, formatIDRCompact } from "@/lib/utils";

export const metadata = { title: "Reimbursement • Finance" };

const FILTERS: Array<{ value: ReimbursementStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "SUBMITTED", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "PAID", label: "Dibayarkan" },
  { value: "REJECTED", label: "Ditolak" },
];

export default async function FinanceReimbursementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["FINANCE"]);
  const params = await searchParams;
  const requested = typeof params.status === "string" ? params.status : "ALL";
  const status = FILTERS.some((entry) => entry.value === requested)
    ? (requested as ReimbursementStatus | "ALL")
    : "ALL";
  const [unread, result] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listReimbursements()),
  ]);

  const header = (
    <Header
      breadcrumb={[{ label: "Finance", href: "/finance/dashboard" }, { label: "Reimbursement" }]}
      unreadCount={unread.count}
      notificationsHref="/finance/notifications"
      profileHref="/finance/profile"
    />
  );
  if (!result.ok) {
    return <><>{header}</><main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop"><ErrorState error={result.error} /></main></>;
  }

  const rows = result.data;
  const filtered = status === "ALL" ? rows : rows.filter((row) => row.status === status);
  const submitted = rows.filter((row) => row.status === "SUBMITTED").length;
  const paid = rows.filter((row) => row.status === "PAID");

  return (
    <>
      {header}
      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader title="Reimbursement" description="Verifikasi dan pembayaran laporan ganti biaya karyawan." />
        <section aria-label="Ringkasan reimbursement" className="grid grid-cols-1 gap-md sm:grid-cols-3">
          <SummaryCard label="Menunggu verifikasi" value={submitted} icon="hourglass_top" tone="accent" footnote="Perlu ditinjau Finance" />
          <SummaryCard label="Total laporan" value={rows.length} icon="receipt_long" tone="primary" footnote="Semua status" />
          <SummaryCard label="Sudah dibayarkan" value={formatIDRCompact(paid.reduce((sum, row) => sum + toNumber(row.approvedAmount), 0))} icon="paid" tone="success" footnote={`${paid.length} laporan`} />
        </section>
        <FilterTabs<ReimbursementStatus | "ALL">
          ariaLabel="Saring reimbursement berdasarkan status"
          paramName="status"
          value={status}
          options={FILTERS.map((entry) => ({ value: entry.value, label: entry.label, count: rows.filter((row) => entry.value === "ALL" || row.status === entry.value).length }))}
        />
        {filtered.length ? <ul className="flex flex-col gap-3">{filtered.map((row) => <FinanceRow key={row.id} reimbursement={row} />)}</ul> : <Card><EmptyState icon="receipt_long" title={rows.length ? "Tidak ada yang cocok" : "Belum ada laporan reimbursement"} description={rows.length ? "Ubah saringan status untuk melihat laporan lainnya." : "Laporan yang dikirim karyawan akan muncul di sini."} /></Card>}
      </main>
    </>
  );
}

function FinanceRow({ reimbursement }: { reimbursement: Reimbursement }) {
  return (
    <li>
      <Link href={`/finance/reimbursements/${reimbursement.id}`} className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-caption text-tertiary">#{reimbursement.id}</span><ReimbursementStatusBadge status={reimbursement.status} /></div>
          <p className="mt-1.5 truncate text-label-md font-semibold text-on-surface">{reimbursement.travel?.destination ?? `Travel #${reimbursement.travelId}`}</p>
          <p className="truncate text-caption text-on-surface-variant">{reimbursement.travel?.user?.name ?? "Pemohon tidak tersedia"}</p>
        </div>
        <div className="text-right"><span className="block text-caption text-tertiary">Total pengajuan</span><span className="font-semibold text-on-surface">{formatIDR(reimbursement.totalAmount)}</span></div>
        <span aria-hidden className="material-symbols-outlined shrink-0 text-outline" style={{ fontSize: 20 }}>chevron_right</span>
      </Link>
    </li>
  );
}
