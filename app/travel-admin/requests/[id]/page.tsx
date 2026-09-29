import Link from "next/link";
import { notFound } from "next/navigation";

import { ApprovalTimeline } from "@/components/travel/approval-timeline";
import { BookingRow } from "@/components/booking/booking-row";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header } from "@/components/layout/header";
import { LinkButton } from "@/components/ui/button";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { getApprovalTimeline } from "@/lib/api/approval";
import { fetchOrNotFound } from "@/lib/api/fetch-or-not-found";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravel, getTravelDocuments } from "@/lib/api/travel";
import { requireBookingManager } from "@/lib/auth";
import { formatDate, formatDateRange, formatIDR } from "@/lib/utils";

export const metadata = { title: "Detail Travel Request • Dinas Travel" };

/**
 * `GET /api/travel/:id` returns the request together with its approval
 * timeline, so the whole screen is one request plus its side resources.
 */
export default async function TravelRequestDetailPage({
  params,
}: PageProps<"/travel-admin/requests/[id]">) {
  await requireBookingManager();
  const { id } = await params;
  const travelId = Number(id);
  if (!Number.isFinite(travelId)) notFound();

  const [travel, unread] = await Promise.all([
    fetchOrNotFound(getTravel(travelId)),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  const [approvals, documents] = await Promise.all([
    travel.approvals ?? getApprovalTimeline(travelId).catch(() => []),
    getTravelDocuments(travelId).catch(() => []),
  ]);

  const canBook = travel.status === "APPROVED";

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Travel Request", href: "/travel-admin/requests" },
          { label: travel.ref ?? `#${travel.id}` },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <Card className="overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container" />
          <div className="flex flex-col gap-md p-md lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-mono text-caption text-tertiary">
                  {travel.ref}
                </span>
                <TravelStatusBadge status={travel.status} />
              </div>
              <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
                {travel.destination}
              </h1>
              <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
                {travel.purpose}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
              {canBook ? (
                <LinkButton
                  href="/travel-admin/bookings/queue"
                  variant="secondary"
                  icon="add"
                >
                  Buat Booking
                </LinkButton>
              ) : (
                <p className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-2 text-caption text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    info
                  </span>
                  Booking hanya untuk pengajuan Disetujui
                </p>
              )}
              {travel.bookings?.length ? (
                <Link
                  href={`/travel-admin/bookings/${travel.id}`}
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Lihat {travel.bookings.length} booking terkait
                </Link>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-outline-variant/15 bg-surface-container-lowest px-md py-md lg:grid-cols-4">
            <Fact label="Pemohon" value={travel.employeeName} sub={travel.positionName} />
            <Fact label="Departemen" value={travel.departmentName ?? "—"} />
            <Fact
              label="Periode"
              value={formatDateRange(travel.startDate, travel.endDate)}
            />
            <Fact label="Estimasi biaya" value={formatIDR(travel.estimatedCost)} />
            {travel.policyName ? (
              <Fact
                label="Kebijakan"
                value={travel.policyName}
                className="col-span-2"
              />
            ) : null}
            <Fact
              label="Tingkat kota"
              value={tierLabel(travel.destinationTier)}
            />
            <Fact
              label="Diajukan"
              value={formatDate(travel.submittedAt ?? travel.createdAt)}
            />
          </dl>
        </Card>

        <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
          <div className="flex flex-col gap-md xl:col-span-2">
            <Card>
              <CardHeader
                title="Booking"
                description={
                  travel.bookings?.length
                    ? `${travel.bookings.length} pemesanan untuk pengajuan ini.`
                    : "Belum ada pemesanan pada pengajuan ini."
                }
              />
              <CardBody className="space-y-3">
                {travel.bookings?.length ? (
                  travel.bookings.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} travel={travel} />
                  ))
                ) : (
                  <EmptyState
                    icon="confirmation_number"
                    title="Belum ada booking"
                    description={
                      canBook
                        ? "Pengajuan ini sudah disetujui dan siap dipesan. Tambahkan tiket atau hotel melalui antrean booking."
                        : "Booking tidak dapat dibuat karena pengajuan belum berstatus Disetujui."
                    }
                    action={
                      canBook ? (
                        <LinkButton
                          href="/travel-admin/bookings/queue"
                          variant="secondary"
                          icon="pending_actions"
                        >
                          Buka Antrean Booking
                        </LinkButton>
                      ) : undefined
                    }
                  />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Dokumen Pendukung"
                description="Diunggah pemohon sebagai dasar verifikasi policy."
              />
              <CardBody>
                {documents.length ? (
                  <ul className="divide-y divide-outline-variant/10">
                    {documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            description
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-md font-medium text-on-surface">
                            {doc.fileName}
                          </p>
                          <p className="text-caption text-tertiary">
                            Diunggah {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <span className="rounded-md bg-primary-fixed px-2 py-1 text-caption font-medium text-on-primary-fixed">
                          {doc.filePath.split(".").pop()?.toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon="folder_open"
                    title="Tidak ada dokumen"
                    description="Pengajuan ini tidak memerlukan dokumen pendukung, atau pemohon belum mengunggah apa pun."
                  />
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Alur Persetujuan"
              description="Tiga tingkat sebelum travel dapat dibooking."
            />
            <ApprovalTimeline approvals={approvals} />
          </Card>
        </div>
      </main>
    </div>
  );
}

function tierLabel(tier?: string) {
  switch (tier) {
    case "TIER_1":
      return "Tier 1 — Jabodetabek";
    case "TIER_2":
      return "Tier 2 — Kota besar";
    case "TIER_3":
      return "Tier 3 — Luar Jawa";
    case "INTERNATIONAL":
      return "Internasional";
    default:
      return "—";
  }
}

function Fact({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-caption text-tertiary">{label}</dt>
      <dd className="mt-0.5 text-label-md font-semibold text-on-surface">
        {value}
      </dd>
      {sub ? <dd className="text-caption text-tertiary">{sub}</dd> : null}
    </div>
  );
}
