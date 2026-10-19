import { notFound } from "next/navigation";

import { ApprovalAction } from "@/components/approval/approval-action";
import { ApprovalDetail } from "@/components/approval/approval-detail";
import { Header, PageHeader } from "@/components/layout/header";
import { APPROVAL_LEVEL_TITLE, ApprovalTimeline } from "@/components/travel/approval-timeline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  canDecideApproval,
  getApprovalTimeline,
  listDelegations,
} from "@/lib/api/approval";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravel, listPolicies } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";

export const metadata = { title: "Detail Persetujuan • Approver" };

/**
 * One request, with the decision form for whichever level is open to this
 * approver.
 *
 * The route takes the travel id, not the approval id. The backend serves no
 * `GET /api/approvals/:id`, and a decision is made on the request as a whole, so
 * `GET /api/travel/:id` — the only response carrying the requester, the timeline
 * and the documents together — is what this page is built on. It is also what
 * scopes access: the backend answers 403 for a request the caller has no
 * approval row on.
 */
export default async function ApproverApprovalDetailPage({
  params,
}: PageProps<"/approver/approvals/[id]">) {
  const user = await requireRole(APPROVER_ROLES);

  const { id } = await params;
  const travelId = Number(id);
  if (!Number.isFinite(travelId)) notFound();

  const [unread, travel, policies, delegations] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(getTravel(travelId)),
    settle(listPolicies()),
    settle(listDelegations()),
  ]);

  const header = (
    <Header
      breadcrumb={[
        { label: "Approver", href: "/approver/dashboard" },
        { label: "Persetujuan", href: "/approver/approvals" },
        { label: `#${travelId}` },
      ]}
      unreadCount={unread.count}
      notificationsHref="/approver/notifications"
      profileHref="/approver/profile"
    />
  );

  if (!travel.ok) {
    return (
      <>
        {header}
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader title="Detail Persetujuan" />
          <ErrorState error={travel.error} />
        </main>
      </>
    );
  }

  const request = travel.data;
  const approvals =
    request.approvals && request.approvals.length
      ? request.approvals
      : await getApprovalTimeline(travelId).catch(() => []);

  const rows = delegations.ok ? delegations.data : [];
  const open = approvals.filter(
    (approval) => approval.status === "PENDING" && canDecideApproval(approval, user.id, rows),
  );
  const waitingOnOthers = approvals.filter(
    (approval) => approval.status === "PENDING" && !canDecideApproval(approval, user.id, rows),
  );

  const policy = policies.ok
    ? policies.data.find((entry) => entry.id === request.policyId)
    : undefined;

  return (
    <>
      {header}

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title={`Pengajuan ${request.destination}`}
          description="Tinjau rincian dan riwayat persetujuan sebelum memberi keputusan."
        />

        <ApprovalDetail travel={request} policyName={policy?.name} />

        <Card>
          <CardHeader
            title="Keputusan Anda"
            description="Satu keputusan menutup tingkat ini dan meneruskan pengajuan ke tingkat berikutnya."
          />
          <CardBody>
            {open.length ? (
              <div className="flex flex-col gap-md">
                {open.map((approval) => (
                  <div key={approval.id} className="flex flex-col gap-3">
                    <p className="text-label-md font-semibold text-on-surface">
                      Tingkat {approval.level} •{" "}
                      {APPROVAL_LEVEL_TITLE[approval.level] ?? "Persetujuan"}
                      {approval.approverId !== user.id ? (
                        <span className="ml-2 font-normal text-caption text-tertiary">
                          (delegasi dari {approval.approver?.name ?? "approver lain"})
                        </span>
                      ) : null}
                    </p>
                    <ApprovalAction approval={approval} />
                  </div>
                ))}
              </div>
            ) : waitingOnOthers.length ? (
              <EmptyState
                compact
                icon="hourglass_top"
                title="Menunggu approver lain"
                description="Pengajuan ini punya tingkat yang masih terbuka, tetapi bukan pada kewenangan Anda."
              />
            ) : (
              <EmptyState
                compact
                icon="task_alt"
                title="Tidak ada keputusan yang menunggu"
                description="Seluruh tingkat persetujuan pada pengajuan ini sudah diputuskan."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Riwayat Persetujuan"
            description="Urut menurut tingkat, sesuai rantai yang dibuat saat pengajuan dikirim."
          />
          <CardBody className="p-0">
            <ApprovalTimeline approvals={approvals} />
          </CardBody>
        </Card>
      </main>
    </>
  );
}
