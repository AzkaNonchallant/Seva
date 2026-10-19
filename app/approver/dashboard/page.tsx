import { ApprovalCard } from "@/components/approval/approval-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { APPROVAL_LEVEL_TITLE } from "@/components/travel/approval-timeline";
import { listDelegations, listPendingApprovals } from "@/lib/api/approval";
import { getUnreadCount } from "@/lib/api/notification";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard Persetujuan • Approver" };

/**
 * Landing screen for the three approver roles.
 *
 * Two reads drive it: the pending queue (`GET /api/approvals/pending`) and the
 * delegations the caller has given or received
 * (`GET /api/approvals/delegations`). Both are scoped by the backend, so the
 * same screen reads differently for a Manager than for a Kepala Bagian without
 * any role branching here.
 */
export default async function ApproverDashboardPage() {
  const user = await requireRole(APPROVER_ROLES);

  const [unread, pending, delegations] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listPendingApprovals()),
    settle(listDelegations()),
  ]);

  const header = (
    <Header
      breadcrumb={[
        { label: "Approver", href: "/approver/dashboard" },
        { label: "Dashboard" },
      ]}
      unreadCount={unread.count}
      notificationsHref="/approver/notifications"
      profileHref="/approver/profile"
    />
  );

  if (!pending.ok) {
    return (
      <>
        {header}
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader title="Dashboard Persetujuan" />
          <ErrorState error={pending.error} />
        </main>
      </>
    );
  }

  const queue = [...pending.data].sort((a, b) => {
    const left = a.createdAt ?? "";
    const right = b.createdAt ?? "";
    if (left !== right) return left < right ? -1 : 1;
    return a.level - b.level;
  });

  const rows = delegations.ok ? delegations.data : [];

  return (
    <>
      {header}

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Dashboard Persetujuan"
          description={`Halo ${user.name}. Pengajuan yang menunggu keputusan pada tingkat kewenangan Anda ditampilkan di bawah.`}
        />

        <section aria-label="Ringkasan persetujuan" className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <SummaryCard
            label="Menunggu Keputusan"
            value={queue.length}
            icon="pending_actions"
            tone="accent"
            footnote="Antrean pada tingkat kewenangan Anda"
          />
          <SummaryCard
            label="Delegasi Persetujuan"
            value={rows.length}
            icon="swap_horiz"
            tone="primary"
            footnote="Dilimpahkan kepada Anda atau oleh Anda"
          />
        </section>

        <Card>
          <CardHeader
            title="Perlu Keputusan Anda"
            description="Dibuka dari yang paling lama menunggu."
            action={
              queue.length ? (
                <span className="text-caption text-tertiary">{queue.length} pengajuan</span>
              ) : null
            }
          />
          <CardBody>
            {queue.length ? (
              <ul className="flex flex-col gap-3">
                {queue.map((approval) => (
                  <li key={approval.id}>
                    <ApprovalCard approval={approval} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon="task_alt"
                title="Antrean bersih"
                description="Tidak ada pengajuan yang menunggu keputusan Anda saat ini."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Delegasi Persetujuan"
            description="Kewenangan yang dilimpahkan selama periode tertentu. Pengelolaan delegasi dilakukan oleh admin pada pass ini."
          />
          <CardBody>
            {rows.length ? (
              <ul className="flex flex-col divide-y divide-outline-variant/15">
                {rows.map((delegation) => {
                  const given = delegation.delegatorId === user.id;
                  const counterparty = given ? delegation.delegate : delegation.delegator;
                  const active =
                    new Date(delegation.startDate) <= new Date() &&
                    new Date() <= new Date(delegation.endDate);
                  return (
                    <li
                      key={delegation.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-body-md text-on-surface">
                          {given
                            ? `Anda melimpahkan ke ${counterparty?.name ?? "—"}`
                            : `${counterparty?.name ?? "—"} melimpahkan kepada Anda`}
                        </p>
                        <p className="text-caption text-tertiary">
                          {formatDate(delegation.startDate)} – {formatDate(delegation.endDate)}
                          {delegation.reason ? ` • ${delegation.reason}` : ""}
                        </p>
                      </div>
                      <Badge tone={active ? "success" : "neutral"} dot>
                        {active ? "Aktif" : "Berakhir"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                compact
                icon="swap_horiz"
                title="Belum ada delegasi"
                description="Tidak ada kewenangan persetujuan yang dilimpahkan kepada atau oleh Anda."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cara kerja persetujuan"
            description="Satu pengajuan dinilai berurutan, satu tingkat demi satu tingkat."
          />
          <CardBody>
            <ol className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((level) => (
                <li key={level} className="flex items-center gap-3 text-body-md">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-caption font-bold text-on-surface-variant">
                    {level}
                  </span>
                  <span className="text-on-surface-variant">
                    {APPROVAL_LEVEL_TITLE[level]}
                  </span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
