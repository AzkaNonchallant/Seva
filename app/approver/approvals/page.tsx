import { ApprovalCard } from "@/components/approval/approval-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { listPendingApprovals } from "@/lib/api/approval";
import { getUnreadCount } from "@/lib/api/notification";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";

export const metadata = { title: "Persetujuan • Approver" };

/**
 * Everything waiting on this approver.
 *
 * `GET /api/approvals/pending` is the only queue the backend offers, and it
 * returns only status PENDING at the caller's own level (plus anything delegated
 * to them). There is no endpoint for decisions already made, so this screen is a
 * work queue rather than a history — offering a "selesai" filter here would be a
 * filter over nothing.
 *
 * Ordered oldest-first, because a queue is served in the order it arrived.
 */
export default async function ApproverApprovalsPage() {
  await requireRole(APPROVER_ROLES);

  const [unread, pending] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listPendingApprovals()),
  ]);

  const header = (
    <Header
      breadcrumb={[
        { label: "Approver", href: "/approver/dashboard" },
        { label: "Persetujuan" },
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
          <PageHeader
            title="Persetujuan"
            description="Antrean pengajuan yang menunggu keputusan Anda."
          />
          <ErrorState error={pending.error} />
        </main>
      </>
    );
  }

  const rows = [...pending.data].sort((a, b) => {
    const left = a.createdAt ?? "";
    const right = b.createdAt ?? "";
    if (left !== right) return left < right ? -1 : 1;
    return a.level - b.level;
  });

  return (
    <>
      {header}

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Persetujuan"
          description="Antrean pengajuan yang menunggu keputusan Anda, dari yang paling lama masuk. Sumber data: GET /api/approvals/pending."
        />

        {rows.length ? (
          <ul className="flex flex-col gap-3">
            {rows.map((approval) => (
              <li key={approval.id}>
                <ApprovalCard approval={approval} />
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon="task_alt"
              title="Tidak ada yang menunggu"
              description="Setiap pengajuan pada tingkat kewenangan Anda sudah diputuskan."
            />
          </Card>
        )}
      </main>
    </>
  );
}
