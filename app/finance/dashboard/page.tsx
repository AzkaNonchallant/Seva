import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { listReimbursements } from "@/lib/api/reimbursement";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { toNumber } from "@/lib/api/types";
import { formatDate, formatIDR, formatIDRCompact } from "@/lib/utils";

export const metadata = { title: "Dashboard • Finance" };

/**
 * Finance overview, built only on §5 endpoints this role owns: the
 * reimbursement queue, and the verify/pay transitions that decide what is owed.
 * Finance is not in scope for this pass, so the screen stays a genuine summary
 * rather than an unfinished workflow.
 */
export default async function FinanceDashboardPage() {
  await requireRole(["FINANCE"]);

  const [unread, rows] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listReimbursements()),
  ]);

  if (!rows.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Finance", href: "/finance/dashboard" },
            { label: "Dashboard" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/finance/notifications"
          profileHref="/finance/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={rows.error} />
        </main>
      </>
    );
  }

  const reimbursements = rows.data;
  const submitted = reimbursements.filter((row) => row.status === "SUBMITTED");
  const approved = reimbursements.filter((row) => row.status === "APPROVED");
  const paid = reimbursements.filter((row) => row.status === "PAID");
  const toPay = approved.reduce((sum, row) => sum + toNumber(row.differenceAmount), 0);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/finance/dashboard" },
          { label: "Finance" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/finance/notifications"
        profileHref="/finance/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Dashboard Finance"
          description="Antrean verifikasi dan pembayaran reimbursement seluruh perusahaan. Sumber data: GET /api/reimbursements."
        />

        <section
          aria-label="Ringkasan keuangan"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Menunggu Verifikasi"
            value={submitted.length}
            icon="hourglass_top"
            tone="accent"
            footnote="Perlu diperiksa Finance"
          />
          <SummaryCard
            label="Siap Dibayar"
            value={approved.length}
            icon="payments"
            tone="primary"
            footnote="Sudah disetujui"
          />
          <SummaryCard
            label="Nilai Outstanding"
            value={formatIDRCompact(toPay)}
            icon="account_balance_wallet"
            tone="success"
            footnote="Total selisih terverifikasi"
          />
          <SummaryCard
            label="Sudah Dibayar"
            value={paid.length}
            icon="task_alt"
            tone="success"
            footnote="Reimbursement lunas"
          />
        </section>

        <Card>
          <CardHeader
            title="Antrean Verifikasi"
            description="Reimbursement berstatus SUBMITTED menunggu keputusan Finance."
          />
          <CardBody>
            {submitted.length ? (
              <ul className="flex flex-col divide-y divide-outline-variant/15">
                {submitted.map((row) => (
                  <li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-md text-on-surface">
                        {row.travel?.user?.name ?? "—"}
                        {row.travel?.destination
                          ? ` • ${row.travel.destination}`
                          : ""}
                      </p>
                      <p className="text-caption text-tertiary">
                        #{row.travelId}
                        {row.submittedAt ? ` • ${formatDate(row.submittedAt)}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-label-md font-semibold text-on-surface">
                      {formatIDR(row.totalAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="task_alt"
                title="Antrean bersih"
                description="Semua reimbursement sudah diverifikasi."
              />
            )}
          </CardBody>
        </Card>

        <p className="text-caption text-tertiary">
          Layar verifikasi dan pembayaran per reimbursement belum
          diimplementasikan pada pass ini. Endpoint PATCH
          /api/reimbursements/:id/verify dan /pay sudah tersedia di service
          layer.
        </p>
      </main>
    </>
  );
}
