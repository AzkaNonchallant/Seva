import Link from "next/link";
import { notFound } from "next/navigation";

import { Header, PageHeader } from "@/components/layout/header";
import { ApprovalTimeline } from "@/components/travel/approval-timeline";
import { DocumentList } from "@/components/travel/document-list";
import { TravelLifecycleActions } from "@/components/travel/travel-lifecycle-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravel, getTravelDocuments, listPolicies } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import {
  countDays,
  formatDate,
  formatDateRange,
  formatIDR,
} from "@/lib/utils";

import { isNotFound } from "@/lib/api/errors";

export const metadata = { title: "Detail Pengajuan • Employee" };

/**
 * One request, with everything the owner is allowed to see or change.
 *
 * The three reads are the ones the spec points at for this screen:
 * `GET /api/travel/:id` (which carries the approval timeline),
 * `GET /api/travel/:id/documents`, and the policy catalogue to resolve whether
 * the chosen policy demands attachments.
 */
export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["EMPLOYEE"]);
  const { id } = await params;

  const [unread, travel, documents, policies] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(getTravel(Number(id))),
    getTravelDocuments(Number(id)).catch(() => []),
    listPolicies().catch(() => []),
  ]);

  if (!travel.ok) {
    if (isNotFound(travel.error)) notFound();
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Pengajuan Travel", href: "/employee/travel" },
            { label: "Detail" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={travel.error} />
        </main>
      </>
    );
  }

  const request = travel.data;
  const policy = policies.find((row) => row.id === request.policyId);
  const isDraft = request.status === "DRAFT";
  const nights = countDays(request.startDate, request.endDate) - 1;

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Pengajuan Travel", href: "/employee/travel" },
          { label: request.ref ?? `#${request.id}` },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title={request.destination}
          description={request.purpose}
          actions={
            isDraft ? (
              <Link
                href={`/employee/travel/${request.id}/edit`}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-md text-label-md font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  edit
                </span>
                Ubah Draft
              </Link>
            ) : null
          }
        />

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <div className="flex flex-col gap-md xl:col-span-2">
            <Card>
              <CardHeader
                title="Ringkasan Pengajuan"
                description={`Dibuat ${formatDate(request.createdAt)}`}
                action={<TravelStatusBadge status={request.status} />}
              />
              <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Fact label="Nomor pengajuan" value={request.ref ?? `#${request.id}`} />
                <Fact label="Tujuan" value={request.destination} />
                <Fact
                  label="Periode"
                  value={`${formatDateRange(request.startDate, request.endDate)} (${nights} malam)`}
                />
                <Fact label="Perkiraan biaya" value={formatIDR(request.estimatedCost)} />
                <Fact
                  label="Travel policy"
                  value={request.policyName ?? "Tidak dipilih"}
                />
                <Fact label="Departemen" value={request.departmentName ?? "—"} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Riwayat Persetujuan"
                description="Satu baris per level, dibuat otomatis saat pengajuan dikirim."
              />
              <ApprovalTimeline approvals={request.approvals ?? []} />
            </Card>

            <Card>
              <CardHeader
                title="Dokumen Pendukung"
                description="Lampiran pada pengajuan ini."
              />
              <CardBody>
                <DocumentList
                  travelId={request.id}
                  documents={documents}
                  canDelete={isDraft}
                  policyRequiresDocuments={!!policy?.requiresDocuments}
                />
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-md">
            <Card>
              <CardHeader
                title="Tindakan"
                description={
                  isDraft
                    ? "Draft belum masuk antrean approval."
                    : request.status === "SUBMITTED"
                      ? "Menunggu keputusan atasan."
                      : "Status sudah melewati tahap pengajuan."
                }
              />
              <CardBody>
                <TravelLifecycleActions travel={request} />
              </CardBody>
            </Card>

            {policy ? (
              <Card>
                <CardHeader title="Kebijakan yang Dipakai" />
                <CardBody className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="primary" icon="policy">
                      {policy.name}
                    </Badge>
                    {policy.requiresDocuments ? (
                      <Badge tone="warning" icon="attach_file">
                        Wajib dokumen
                      </Badge>
                    ) : null}
                  </div>
                  {policy.description ? (
                    <p className="text-caption text-on-surface-variant">
                      {policy.description}
                    </p>
                  ) : null}
                  <dl className="mt-1 space-y-1 text-caption">
                    <div className="flex justify-between gap-3">
                      <dt className="text-tertiary">Batas biaya</dt>
                      <dd className="text-on-surface">
                        {policy.maxEstimatedCost
                          ? formatIDR(policy.maxEstimatedCost)
                          : "Tanpa batas"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-tertiary">Tingkat tujuan</dt>
                      <dd className="text-on-surface">
                        {policy.destinationTier ?? "ANY"}
                      </dd>
                    </div>
                  </dl>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader title="Riwayat Status" />
              <CardBody className="space-y-2 text-caption">
                <div className="flex justify-between gap-3">
                  <span className="text-tertiary">Dibuat</span>
                  <span className="text-on-surface">
                    {formatDate(request.createdAt)}
                  </span>
                </div>
                {request.submittedAt ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-tertiary">Diajukan</span>
                    <span className="text-on-surface">
                      {formatDate(request.submittedAt)}
                    </span>
                  </div>
                ) : null}
                {request.cancelledAt ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-tertiary">Dibatalkan</span>
                    <span className="text-on-surface">
                      {formatDate(request.cancelledAt)}
                    </span>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-caption text-tertiary">{label}</p>
      <p className="mt-0.5 break-words text-label-md font-semibold text-on-surface">
        {value}
      </p>
    </div>
  );
}
