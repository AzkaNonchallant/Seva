import Link from "next/link";
import { notFound } from "next/navigation";

import { Header, PageHeader } from "@/components/layout/header";
import { ExpenseItemList } from "@/components/reimbursement/expense-item-list";
import { ReimbursementForm } from "@/components/reimbursement/reimbursement-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { getReimbursement } from "@/lib/api/reimbursement";
import { settle } from "@/lib/api/api";
import { isNotFound } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";
import { cn, formatDate, formatIDR } from "@/lib/utils";

export const metadata = { title: "Detail Reimbursement • Employee" };

/**
 * One reimbursement: the header figures, the item list, and — while it is still
 * DRAFT — the form that adds items and submits it. The `differenceAmount` the
 * spec has the server compute is shown as-is rather than recalculated here.
 */
export default async function ReimbursementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["EMPLOYEE"]);
  const { id } = await params;

  const [unread, reimbursement] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(getReimbursement(Number(id))),
  ]);

  if (!reimbursement.ok) {
    if (isNotFound(reimbursement.error)) notFound();
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Reimbursement", href: "/employee/reimbursements" },
            { label: "Detail" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={reimbursement.error} />
        </main>
      </>
    );
  }

  const claim = reimbursement.data;
  const items = claim.items ?? [];
  const isDraft = claim.status === "DRAFT";

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Reimbursement", href: "/employee/reimbursements" },
          { label: claim.travelRef ?? `#${claim.travelId}` },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Detail Reimbursement"
          description={`Travel ${claim.travelRef ?? `#${claim.travelId}`} • ${claim.employeeName}`}
          actions={
            <Link
              href={`/employee/travel/${claim.travelId}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-md text-label-md font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                arrow_back
              </span>
              Lihat Travel
            </Link>
          }
        />

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <div className="flex flex-col gap-md xl:col-span-2">
            <Card>
              <CardHeader
                title="Rincian Pengeluaran"
                description={
                  isDraft
                    ? "Tambahkan item, lalu ajukan ke Finance."
                    : "Reimbursement sudah diajukan dan tidak dapat diubah."
                }
                action={<ReimbursementStatusBadge status={claim.status} />}
              />
              <CardBody>
                <ExpenseItemList
                  reimbursementId={claim.id}
                  items={items}
                  canDelete={isDraft}
                />
              </CardBody>
            </Card>

            {isDraft ? (
              <Card>
                <CardHeader
                  title="Tambah Item"
                  description="POST /api/reimbursements/:id/items"
                />
                <CardBody>
                  <ReimbursementForm reimbursement={claim} />
                </CardBody>
              </Card>
            ) : null}
          </div>

          <div className="flex flex-col gap-md">
            <Card>
              <CardHeader title="Ringkasan Nilai" />
              <CardBody className="space-y-2.5">
                <Line
                  label="Total pengajuan"
                  value={formatIDR(claim.totalAmount)}
                />
                <Line
                  label="Uang muka"
                  value={formatIDR(claim.advanceAmount)}
                />
                {claim.status !== "DRAFT" ? (
                  <>
                    <Line
                      label="Disetujui Finance"
                      value={formatIDR(claim.approvedAmount)}
                      strong
                    />
                    <Line
                      label="Selisih"
                      value={formatIDR(claim.differenceAmount)}
                      strong
                      tone={claim.differenceAmount < 0 ? "error" : "success"}
                    />
                  </>
                ) : null}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Status Verifikasi" />
              <CardBody className="flex flex-col gap-2 text-caption">
                <div className="flex justify-between gap-3">
                  <span className="text-tertiary">Diajukan</span>
                  <span className="text-on-surface">
                    {claim.submittedAt
                      ? formatDate(claim.submittedAt)
                      : "Belum diajukan"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-tertiary">Dibayar</span>
                  <span className="text-on-surface">
                    {claim.paidAt ? formatDate(claim.paidAt) : "—"}
                  </span>
                </div>
                {claim.externalJournalRef ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-tertiary">Ref. jurnal</span>
                    <span className="font-mono text-on-surface">
                      {claim.externalJournalRef}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {claim.status === "SUBMITTED" ? (
                    <Badge tone="warning" dot>
                      Menunggu verifikasi Finance
                    </Badge>
                  ) : null}
                  {claim.status === "REJECTED" ? (
                    <Badge tone="error" dot>
                      Ditolak Finance
                    </Badge>
                  ) : null}
                  {claim.status === "PAID" ? (
                    <Badge tone="success" dot>
                      Sudah dibayarkan
                    </Badge>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Tentang Verifikasi" />
              <CardBody className="flex flex-col gap-2 text-caption text-on-surface-variant">
                <p>
                  Finance memverifikasi tiap reimbursement melalui PATCH
                  /api/reimbursements/:id/verify, lalu menandainya lunas dengan
                  PATCH /api/reimbursements/:id/pay. Selisih antara nominal yang
                  disetujui dan uang muka dihitung oleh server.
                </p>
                <p>
                  reimbursement yang ditolak dapat diperbaiki dengan membuat
                  pengajuan baru untuk travel yang sama.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "success" | "error";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-caption text-tertiary">{label}</span>
      <span
        className={cn(
          strong ? "text-label-md font-bold" : "text-body-md",
          tone === "error"
            ? "text-error"
            : tone === "success"
              ? "text-success"
              : "text-on-surface",
        )}
      >
        {value}
      </span>
    </div>
  );
}
