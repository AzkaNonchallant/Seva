import Link from "next/link";

import { Header, PageHeader } from "@/components/layout/header";
import { TravelRow } from "@/components/travel/travel-row";
import { ApprovalTimeline } from "@/components/travel/approval-timeline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { NotificationList } from "@/components/ui/notification-list";
import { ReimbursementStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount, listNotifications } from "@/lib/api/notification";
import { listReimbursements } from "@/lib/api/reimbursement";
import { listTravels } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { toNumber } from "@/lib/api/types";
import { daysUntil, formatDate, formatIDR, formatIDRCompact } from "@/lib/utils";

export const metadata = { title: "Dashboard • Employee" };

/**
 * Employee overview.
 *
 * Everything here is derived from endpoints §3 and §5 already give this role:
 * `GET /api/travel` (own rows), `GET /api/reimbursements` (own rows),
 * `GET /api/notifications`. No aggregate or admin-only call is used, so the page
 * cannot show anything the employee is not entitled to see.
 */
export default async function EmployeeDashboardPage() {
  const user = await requireRole(["EMPLOYEE"]);

  const [travels, reimbursements, notifications, unread] = await Promise.all([
    settle(listTravels()),
    settle(listReimbursements()),
    settle(listNotifications()),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  if (!travels.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Horizon Odyssey", href: "/employee/dashboard" },
            { label: "Employee" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader title="Dashboard" description="Ringkasan aktivitas dinas Anda." />
          <ErrorState error={travels.error} />
        </main>
      </>
    );
  }

  const travelRows = travels.data;
  const reimbursementRows = reimbursements.ok ? reimbursements.data : [];
  const notificationRows = notifications.ok ? notifications.data : [];

  const drafts = travelRows.filter((row) => row.status === "DRAFT");
  const waiting = travelRows.filter((row) => row.status === "SUBMITTED");
  const upcoming = travelRows
    .filter((row) => row.status === "APPROVED" && daysUntil(row.startDate) >= 0)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const completed = travelRows.filter((row) => row.status === "COMPLETED");

  const openReimbursements = reimbursementRows.filter(
    (row) => row.status === "DRAFT" || row.status === "SUBMITTED",
  );
  const owed = reimbursementRows
    .filter((row) => row.status === "APPROVED" || row.status === "PAID")
    .reduce((sum, row) => sum + Math.max(0, toNumber(row.differenceAmount)), 0);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/employee/dashboard" },
          { label: "Employee" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title={`Halo, ${user.name.split(" ")[0]}`}
          description="Status pengajuan travel, reimbursement, dan pemberitahuan Anda dalam satu halaman."
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
          aria-label="Ringkasan aktivitas"
          className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Draft"
            value={drafts.length}
            icon="edit_note"
            tone="neutral"
            footnote="Perlu lengkapi sebelum dikirim"
            href="/employee/travel?status=DRAFT"
          />
          <SummaryCard
            label="Menunggu Persetujuan"
            value={waiting.length}
            icon="hourglass_top"
            tone="accent"
            footnote="Sedang di rantai approval"
            href="/employee/travel?status=SUBMITTED"
          />
          <SummaryCard
            label="Travel Mendatang"
            value={upcoming.length}
            icon="flight_takeoff"
            tone="primary"
            footnote={
              upcoming[0]
                ? `Berikutnya ${formatDate(upcoming[0].startDate)}`
                : "Belum ada jadwal"
            }
            href="/employee/travel?status=APPROVED"
          />
          <SummaryCard
            label="Sisa Reimbursement"
            value={formatIDRCompact(owed)}
            icon="account_balance_wallet"
            tone="success"
            footnote={`${openReimbursements.length} sedang diproses`}
            href="/employee/reimbursements"
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title="Pengajuan Terakhir"
              description="Lima pengajuan terbaru milik Anda."
              action={
                <Link
                  href="/employee/travel"
                  className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
                >
                  Lihat semua
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {travelRows.length ? (
                travelRows.slice(0, 5).map((travel) => (
                  <TravelRow key={travel.id} travel={travel} />
                ))
              ) : (
                <EmptyState
                  icon="flight_takeoff"
                  title="Belum ada pengajuan"
                  description="Buat draft pertama Anda untuk memulai proses pengajuan travel dinas."
                  action={
                    <Link
                      href="/employee/travel/new"
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        add
                      </span>
                      Buat Pengajuan
                    </Link>
                  }
                />
              )}
            </CardBody>
          </Card>

          <div className="flex flex-col gap-md">
            {upcoming[0] ? (
              <Card>
                <CardHeader
                  title="Travel Mendatang"
                  description={`Berangkat ${formatDate(upcoming[0].startDate)}`}
                />
                <CardBody className="flex flex-col gap-3">
                  <div>
                    <p className="text-headline-md font-semibold text-on-surface">
                      {upcoming[0].destination}
                    </p>
                    <p className="mt-0.5 text-caption text-on-surface-variant">
                      {upcoming[0].purpose}
                    </p>
                  </div>
                  <dl className="space-y-1.5 text-caption">
                    <div className="flex justify-between gap-3">
                      <dt className="text-tertiary">Periode</dt>
                      <dd className="text-right text-on-surface">
                        {formatDate(upcoming[0].startDate)} →{" "}
                        {formatDate(upcoming[0].endDate)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-tertiary">Estimasi</dt>
                      <dd className="text-on-surface">
                        {formatIDR(upcoming[0].estimatedCost)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/employee/travel/${upcoming[0].id}`}
                    className="text-caption font-semibold text-primary transition-colors hover:text-primary-container"
                  >
                    Lihat detail pengajuan
                  </Link>
                </CardBody>
              </Card>
            ) : null}

            {waiting[0]?.approvals?.length ? (
              <Card>
                <CardHeader
                  title="Progres Persetujuan"
                  description={`#${waiting[0].id}`}
                />
                <ApprovalTimeline approvals={waiting[0].approvals ?? []} />
              </Card>
            ) : null}

            <Card>
              <CardHeader
                title="Reimbursement"
                description="Status pengajuan ganti biaya Anda."
                action={
                  <Link
                    href="/employee/reimbursements"
                    className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
                  >
                    Lihat semua
                  </Link>
                }
              />
              <CardBody>
                {reimbursementRows.length ? (
                  <ul className="flex flex-col divide-y divide-outline-variant/15">
                    {reimbursementRows.slice(0, 4).map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5"
                      >
                        {/* `basis-0` lets the text column claim the free space
                            while the amount stays whole; a rupiah figure has
                            no break opportunity, so it must not be the element
                            that shrinks. The row wraps so the badge can drop to
                            its own line in a narrow sidebar column. */}
                        <div className="min-w-0 flex-1 basis-32">
                          <p className="truncate font-mono text-caption text-tertiary">
                            #{row.travelId}
                          </p>
                          <p className="whitespace-nowrap text-body-md text-on-surface">
                            {formatIDR(row.totalAmount)}
                          </p>
                        </div>
                        <ReimbursementStatusBadge status={row.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon="receipt_long"
                    title="Belum ada reimbursement"
                    description="Reimbursement dapat dibuat setelah travel Anda berstatus selesai."
                  />
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Notifikasi Terbaru"
            description="Pemberitahuan approval dan reimbursement terbaru."
            action={
              <Link
                href="/employee/notifications"
                className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
              >
                Lihat semua
              </Link>
            }
          />
          <CardBody>
            {notificationRows.length ? (
              <NotificationList
                notifications={notificationRows.slice(0, 5)}
                role={user.role}
              />
            ) : (
              <EmptyState
                icon="notifications_none"
                title="Tidak ada notifikasi"
                description="Kabar approval dan reimbursement akan muncul di sini."
              />
            )}
          </CardBody>
        </Card>

        {completed.length ? (
          <p className="text-caption text-tertiary">
            {completed.length} travel selesai. Anda dapat mengajukan reimbursement
            atas perjalanan yang berstatus Selesai.
          </p>
        ) : null}
      </main>
    </>
  );
}
