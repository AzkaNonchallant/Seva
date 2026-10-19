import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { countDays, formatDateRange, formatIDR, initials } from "@/lib/utils";

import type { TravelRequest } from "@/lib/api/types";

/**
 * The request an approver is being asked to decide on.
 *
 * `GET /api/travel/:id` is the only endpoint that carries the requester and the
 * full request, so this block is built entirely from that one response — the
 * approval rows themselves carry no travel detail beyond the four fields the
 * queue embedded.
 */
export function ApprovalDetail({
  travel,
  policyName,
}: {
  travel: TravelRequest;
  /** Resolved by the page from `GET /api/travel/policies`; omitted if unavailable. */
  policyName?: string;
}) {
  const days = countDays(travel.startDate, travel.endDate);

  return (
    <Card>
      <CardHeader
        title={travel.destination}
        description={`Pengajuan #${travel.id}`}
        action={<TravelStatusBadge status={travel.status} />}
      />

      <div className="flex items-start gap-4 border-b border-outline-variant/15 p-md">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container">
          {initials(travel.user?.name ?? "?")}
        </span>
        <div className="min-w-0">
          <p className="text-label-md font-semibold text-on-surface">
            {travel.user?.name ?? "Pengaju tidak diketahui"}
          </p>
          <p className="truncate text-caption text-on-surface-variant">
            {travel.user?.email ?? "—"}
          </p>
        </div>
      </div>

      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Fact label="Keperluan" value={travel.purpose} />
        <Fact label="Periode" value={formatDateRange(travel.startDate, travel.endDate)} />
        <Fact label="Lama perjalanan" value={days > 0 ? `${days} hari` : "—"} />
        <Fact label="Estimasi biaya" value={formatIDR(travel.estimatedCost)} />
        <Fact
          label="Kebijakan"
          value={policyName ?? (travel.policyId ? `#${travel.policyId}` : "Tidak ditentukan")}
        />
        <Fact
          label="Lampiran"
          value={`${travel.documents?.length ?? 0} dokumen • ${travel.bookings?.length ?? 0} booking`}
        />
      </CardBody>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-tertiary">{label}</p>
      <p className="mt-0.5 text-label-md font-semibold text-on-surface">{value}</p>
    </div>
  );
}
