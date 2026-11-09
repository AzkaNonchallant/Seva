import Link from "next/link";

import { Header, PageHeader } from "@/components/layout/header";
import { ExpenseItemList } from "@/components/reimbursement/expense-item-list";
import { ReimbursementReport } from "@/components/reimbursement/reimbursement-report";
import { FinanceVerificationForm } from "@/components/reimbursement/finance-verification-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { getReimbursement } from "@/lib/api/reimbursement";
import { settle } from "@/lib/api/api";
import { isNotFound } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/utils";
import { notFound } from "next/navigation";

export const metadata = { title: "Detail Reimbursement • Finance" };

export default async function FinanceReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["FINANCE"]);
  const { id } = await params;
  const [unread, result] = await Promise.all([getUnreadCount().catch(() => ({ count: 0 })), settle(getReimbursement(Number(id))) ]);
  const header = <Header breadcrumb={[{ label: "Finance", href: "/finance/dashboard" }, { label: "Reimbursement", href: "/finance/reimbursements" }, { label: `#${id}` }]} unreadCount={unread.count} notificationsHref="/finance/notifications" profileHref="/finance/profile" />;
  if (!result.ok) {
    if (isNotFound(result.error)) notFound();
    return <><>{header}</><main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop"><ErrorState error={result.error} /></main></>;
  }
  const claim = result.data;
  return <>
    {header}
      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader title="Detail Reimbursement" description={`Travel #${claim.travelId}`} actions={<Link href="/finance/reimbursements" className="inline-flex min-h-11 items-center rounded-lg px-md font-semibold text-primary hover:bg-primary-fixed/30">Kembali ke daftar</Link>} />
      {(claim.status === "SUBMITTED" || claim.status === "IN_REVIEW") ? (
        <Card>
          <CardHeader
            title="Verifikasi Finance"
            description="Periksa bukti pengeluaran, tentukan nominal yang disetujui, lalu pilih keputusan."
          />
          <CardBody>
            <FinanceVerificationForm
              reimbursementId={claim.id}
              totalAmount={claim.totalAmount}
            />
          </CardBody>
        </Card>
      ) : null}
      <ReimbursementReport reimbursement={claim} />
      <Card><CardHeader title="Rincian Pengeluaran" action={<ReimbursementStatusBadge status={claim.status} />} /><CardBody><ExpenseItemList reimbursementId={claim.id} items={claim.items ?? []} canDelete={false} /></CardBody></Card>
      <Card><CardHeader title="Status Pembayaran" /><CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="Diajukan" value={claim.submittedAt ? formatDate(claim.submittedAt) : "Belum diajukan"} /><Info label="Total" value={formatIDR(claim.totalAmount)} /><Info label="Disetujui" value={formatIDR(claim.approvedAmount)} /><Info label="Referensi jurnal" value={claim.externalJournalRef ?? "Belum tersedia"} /></CardBody></Card>
    </main>
  </>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-caption text-tertiary">{label}</p><p className="mt-0.5 font-semibold text-on-surface">{value}</p></div>; }
